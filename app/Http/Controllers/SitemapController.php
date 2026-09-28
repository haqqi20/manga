<?php

namespace App\Http\Controllers;

use App\Models\Anime;
use App\Models\Chapter;
use App\Models\Episode;
use App\Models\Genre;
use App\Models\Manga;
use App\Models\Page;

class SitemapController extends Controller
{
    protected int $limit = 10000;

    public function index()
    {
        $maps = [];
        $maps[] = url('/sitemap/static.xml');

        $types = [
            'anime' => Anime::count(),
            'episode' => Episode::count(),
            'manga' => Manga::count(),
            'chapter' => Chapter::count(),
        ];

        foreach ($types as $type => $count) {
            $pages = ceil($count / $this->limit);

            for ($i = 1; $i <= $pages; $i++) {
                $maps[] = url("/sitemap/{$type}/{$i}.xml");
            }
        }

        return response()
            ->view('sitemap.index', compact('maps'))
            ->header('Content-Type', 'application/xml');
    }

    public function static()
    {
        $pages = Page::where('status', 'published')->select('slug', 'updated_at')->get();
        $genres = Genre::select('slug')->get();

        return response()
            ->view('sitemap.static', compact('pages', 'genres'))
            ->header('Content-Type', 'application/xml');
    }

    public function map($type, $page)
    {
        $offset = ($page - 1) * $this->limit;

        switch ($type) {
            case 'anime':
                $data = Anime::select('slug', 'updated_at')
                    ->skip($offset)
                    ->take($this->limit)
                    ->get();

                return $this->renderAnime($data);

            case 'episode':
                $data = Episode::with('anime:id,slug')
                    ->select('anime_id', 'number', 'created_at')
                    ->skip($offset)
                    ->take($this->limit)
                    ->get();

                return $this->renderEpisode($data);

            case 'manga':
                $data = Manga::select('slug', 'updated_at')
                    ->skip($offset)
                    ->take($this->limit)
                    ->get();

                return $this->renderManga($data);

            case 'chapter':
                $data = Chapter::with('manga:id,slug')
                    ->select('manga_id', 'chapter_number', 'updated_at')
                    ->skip($offset)
                    ->take($this->limit)
                    ->get();

                return $this->renderChapter($data);

            default:
                abort(404);
        }
    }

    private function renderAnime($data)
    {
        $xml = $this->xmlStart();

        foreach ($data as $anime) {
            $xml .= '
            <url>
                <loc>' . route('anime.show', $anime->slug) . '</loc>
                <lastmod>' . $anime->updated_at->toAtomString() . '</lastmod>
            </url>';
        }

        return $this->responseXml($xml);
    }

    private function renderEpisode($data)
    {
        $xml = $this->xmlStart();

        foreach ($data as $ep) {
            if (!$ep->anime) continue;

            $xml .= '
            <url>
                <loc>' . route('episode.show', [
                    'slug' => $ep->anime->slug,
                    'number' => $ep->number,
                ]) . '</loc>
                <lastmod>' . $ep->created_at->toAtomString() . '</lastmod>
            </url>';
        }

        return $this->responseXml($xml);
    }

    private function renderManga($data)
    {
        $xml = $this->xmlStart();

        foreach ($data as $manga) {
            $xml .= '
            <url>
                <loc>' . route('manga.show', $manga->slug) . '</loc>
                <lastmod>' . $manga->updated_at->toAtomString() . '</lastmod>
            </url>';
        }

        return $this->responseXml($xml);
    }

    private function renderChapter($data)
    {
        $xml = $this->xmlStart();

        foreach ($data as $chapter) {
            if (!$chapter->manga) continue;

            $xml .= '
            <url>
                <loc>' . route('manga.read', [
                    'slug' => $chapter->manga->slug,
                    'number' => $chapter->chapter_number,
                ]) . '</loc>
                <lastmod>' . $chapter->updated_at->toAtomString() . '</lastmod>
            </url>';
        }

        return $this->responseXml($xml);
    }

    private function xmlStart()
    {
        return '<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    }

    private function responseXml($xml)
    {
        $xml .= '</urlset>';

        return response($xml, 200)
            ->header('Content-Type', 'application/xml');
    }
}