/**
 * Mangaku CDN — cdn.mangaku.lol
 *
 * URL:   https://cdn.mangaku.lol/<host-sumber>/<path>
 * Alur:  cache edge → R2 → (jika belum ada) ambil dari sumber, simpan ke R2, kirim.
 *
 * Harus selaras dengan config/cdn.php (image_hosts) di aplikasi Laravel.
 */

const ALLOWED_HOSTS = [
    /^(?:img|img1|img2|thumbnail)\.komiku\.org$/,
    /^komiku\.org$/,
    /^(?:image\d{1,2}|thumbnail)\.komiku\.to$/,
    /^s4\.anilist\.co$/,
    /^novel\.kiryuuid\.net$/,
];

// Domain yang boleh menampilkan gambar (anti-hotlink). Referer kosong tetap diizinkan.
const SITE_DOMAIN = 'mangaku.lol';

const IMAGE_EXT = /\.(?:jpe?g|png|webp|gif|avif)$/i;
const MAX_BYTES = 20 * 1024 * 1024;
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

function reply(status, text, extra = {}) {
    return new Response(text, {
        status,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', ...extra },
    });
}

function isAllowedReferer(referer) {
    if (!referer) return true;
    try {
        const host = new URL(referer).hostname;
        return host === SITE_DOMAIN || host.endsWith('.' + SITE_DOMAIN);
    } catch {
        return true;
    }
}

function imageHeaders(contentType, extra = {}) {
    return {
        'Content-Type': contentType,
        'Cache-Control': CACHE_CONTROL,
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff',
        ...extra,
    };
}

export default {
    async fetch(request, env, ctx) {
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            return reply(405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
        }

        const url = new URL(request.url);

        if (url.pathname === '/' || url.pathname === '/favicon.ico') {
            return reply(404, 'Not Found');
        }
        if (!isAllowedReferer(request.headers.get('Referer'))) {
            return reply(403, 'Forbidden');
        }

        const match = url.pathname.match(/^\/([a-z0-9.-]+)(\/.+)$/i);
        if (!match) return reply(404, 'Not Found');

        const host = match[1].toLowerCase();
        const path = match[2];
        if (!ALLOWED_HOSTS.some((re) => re.test(host)) || !IMAGE_EXT.test(path) || path.includes('..')) {
            return reply(404, 'Not Found');
        }

        const key = host + path + url.search;
        const cache = caches.default;
        const cacheKey = new Request(`https://${url.hostname}/${key}`, { method: 'GET' });
        const asHead = (res) => (request.method === 'HEAD' ? new Response(null, res) : res);

        // 1. Cache edge Cloudflare
        const cached = await cache.match(cacheKey);
        if (cached) {
            const hit = new Response(cached.body, cached);
            hit.headers.set('X-CDN-Source', 'edge-cache');
            return asHead(hit);
        }

        // 2. R2
        const object = await env.BUCKET.get(key);
        if (object) {
            const res = new Response(object.body, {
                headers: imageHeaders(object.httpMetadata?.contentType || 'image/jpeg', {
                    ETag: object.httpEtag,
                    'X-CDN-Source': 'r2',
                }),
            });
            ctx.waitUntil(cache.put(cacheKey, res.clone()));
            return asHead(res);
        }

        // 3. Ambil dari sumber, simpan ke R2
        let origin;
        try {
            origin = await fetch(`https://${host}${path}${url.search}`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MangakuCDN/1.0; +https://mangaku.lol)', Accept: 'image/*' },
                cf: { cacheTtl: 3600 },
            });
        } catch {
            return reply(502, 'Bad Gateway');
        }

        const contentType = origin.headers.get('Content-Type') || '';
        if (!origin.ok || !contentType.startsWith('image/')) {
            return reply(origin.status === 404 ? 404 : 502, 'Image not available');
        }

        const declared = Number(origin.headers.get('Content-Length') || 0);
        if (declared > MAX_BYTES) {
            return reply(413, 'Image too large');
        }

        const body = await origin.arrayBuffer();
        if (body.byteLength === 0 || body.byteLength > MAX_BYTES) {
            return reply(502, 'Invalid image');
        }

        ctx.waitUntil(
            env.BUCKET.put(key, body, {
                httpMetadata: { contentType, cacheControl: CACHE_CONTROL },
                customMetadata: { source: `https://${host}${path}${url.search}` },
            })
        );

        const res = new Response(body, { headers: imageHeaders(contentType, { 'X-CDN-Source': 'origin' }) });
        ctx.waitUntil(cache.put(cacheKey, res.clone()));
        return asHead(res);
    },
};
