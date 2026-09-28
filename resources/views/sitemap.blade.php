<?= '<?xml version="1.0" encoding="UTF-8"?>'; ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>{{ url('/') }}</loc>
        <lastmod>{{ now()->tz('UTC')->toAtomString() }}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>{{ route('explore') }}</loc>
        <lastmod>{{ now()->tz('UTC')->toAtomString() }}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>

    @foreach ($pages as $page)
        <url>
            <loc>{{ url('/page/' . $page->slug) }}</loc>
            <lastmod>{{ $page->updated_at->tz('UTC')->toAtomString() }}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.5</priority>
        </url>
    @endforeach

    @foreach ($genres as $genre)
        <url>
            <loc>{{ route('explore', ['genre' => $genre->slug]) }}</loc>
            <lastmod>{{ now()->tz('UTC')->toAtomString() }}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.6</priority>
        </url>
    @endforeach

    @foreach ($animes as $anime)
        <url>
            <loc>{{ route('anime.show', $anime->slug) }}</loc>
            <lastmod>{{ $anime->updated_at->tz('UTC')->toAtomString() }}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
        </url>
    @endforeach

    @foreach ($episodes as $episode)
        <url>
            <loc>{{ route('episode.show', ['slug' => $episode->anime->slug, 'number' => $episode->number]) }}</loc>
            <lastmod>{{ $episode->created_at->tz('UTC')->toAtomString() }}</lastmod>
            <changefreq>never</changefreq>
            <priority>0.6</priority>
        </url>
    @endforeach
</urlset>
