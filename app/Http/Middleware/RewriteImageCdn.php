<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Menulis ulang URL gambar dari host eksternal ke CDN sendiri:
 *   https://img.komiku.org/a/b.jpg  ->  https://cdn.mangaku.lol/img.komiku.org/a/b.jpg
 *
 * Dilakukan pada respons HTML/JSON sehingga data di database tidak berubah.
 * Hanya URL berekstensi gambar yang diubah (link sumber/API tidak tersentuh).
 */
class RewriteImageCdn
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $cdn = config('cdn.image_url');
        if (!$cdn || $response->isRedirection()) {
            return $response;
        }

        $type = (string) $response->headers->get('Content-Type', '');
        if (!str_contains($type, 'text/html') && !str_contains($type, 'json')) {
            return $response;
        }

        $content = $response->getContent();
        if ($content === false || $content === '') {
            return $response;
        }

        $hosts = implode('|', config('cdn.image_hosts', []));
        $ext   = config('cdn.image_extensions');

        // Menangani bentuk biasa (https://) dan JSON ter-escape (https:\/\/).
        $pattern = '~https?:(\\\\?/\\\\?/)(' . $hosts . ')((?:\\\\?/)[^"\'\s<>]*?\.(?:' . $ext . '))(?=[?#"\'\s<>&\\\\]|$)~i';

        $rewritten = preg_replace_callback($pattern, function ($m) use ($cdn) {
            $slashes = $m[1];                       // "//" atau "\/\/"
            $escaped = str_contains($slashes, '\\');
            $base    = $escaped ? str_replace('/', '\\/', $cdn) : $cdn;
            $sep     = $escaped ? '\\/' : '/';

            return $base . $sep . strtolower($m[2]) . $m[3];
        }, $content);

        if ($rewritten !== null && $rewritten !== $content) {
            $response->setContent($rewritten);
            $response->headers->remove('Content-Length');
        }

        return $response;
    }
}
