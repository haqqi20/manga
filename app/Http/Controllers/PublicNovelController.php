<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use App\Models\Novel;
use App\Models\NovelChapter;
use App\Services\KiryuuNovelApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicNovelController extends Controller
{
    public function index(Request $request)
    {
        $query = Novel::with(['genres', 'lastChapter'])->withCount('chapters');
        if ($request->filled('search')) $query->where('title', 'like', '%' . $request->search . '%');
        if ($request->filled('letter')) {
            $letter = $request->letter;
            $letter === '#' ? $query->whereRaw('title REGEXP "^[^a-zA-Z]"') : $query->where('title', 'like', $letter . '%');
        }
        if ($request->filled('status') && $request->status !== 'all') $query->where('status', $request->status);
        if ($request->filled('type') && $request->type !== 'all') {
            $type = $request->type;
            $query->where(function ($q) use ($type) {
                $q->where('type', $type)
                  ->orWhereHas('genres', fn($g) => $g->where('slug', \Illuminate\Support\Str::slug($type))->orWhere('name', $type));
            });
        }
        if ($request->filled('genre')) {
            $query->whereHas('genres', fn($q) => $q->where('slug', $request->genre));
        }
        switch ($request->sort) {
            case 'popular': $query->orderByDesc('views_count'); break;
            case 'rating': $query->orderByDesc('rating'); break;
            case 'title': $query->orderBy('title'); break;
            case 'new_manga': $query->latest(); break;
            default:
                $query->orderByDesc(
                    NovelChapter::select('created_at')->whereColumn('novel_id', 'novels.id')->orderByDesc('created_at')->limit(1)
                )->latest();
        }
        return Inertia::render('Novel/Index', [
            'mangas' => $query->paginate(24)->withQueryString(),
            'genres' => Genre::all(),
            'filters' => (object) $request->only(['search','status','genre','sort','letter','type']),
        ]);
    }

    public function show(string $slug, KiryuuNovelApiService $api)
    {
        $novel = Novel::with(['genres', 'chapters' => fn($q) => $q->orderBy('position')->orderBy('id')])->where('slug', $slug)->firstOrFail();
        $novel->increment('views_count');

        $chapters = $novel->chapters;
        if ($chapters->isEmpty()) {
            try {
                $live = collect($api->chapters($novel->slug, $novel->api_base_url))->values()->map(fn($ch, $i) => $api->normalizeChapter($ch, $i));
                $chapters = $live->values();
                $novel->setRelation('chapters', $chapters);
            } catch (\Throwable $e) {
                $novel->setRelation('chapters', collect());
            }
        }

        $firstChapter = null;
        if ($novel->first_chapter_slug) {
            $firstChapter = [
                'title' => $novel->first_chapter_title ?: 'Read First',
                'slug' => $novel->first_chapter_slug,
                'chapter_number' => 1,
            ];
        } else {
            $firstChapter = collect($novel->chapters)->first();
        }

        $novel->synopsis = $this->normalizeSynopsisForView($novel->synopsis);
        $related = Novel::with(['genres','lastChapter'])->where('id', '!=', $novel->id)->latest()->take(8)->get();
        return Inertia::render('Novel/Show', [
            'manga' => $novel,
            'mangaRank' => Novel::where('views_count', '>', $novel->views_count)->count() + 1,
            'firstChapter' => $firstChapter,
            'relatedMangas' => $related,
            'relatedNovels' => $related,
            'isBookmarked' => false,
            'readChapterIds' => [],
            'userRating' => 0,
            'totalRaters' => 0,
        ]);
    }

    public function read(string $slug, string $chapter, KiryuuNovelApiService $api)
    {
        $novel = Novel::where('slug', $slug)->firstOrFail();
        $novel->increment('views_count');
        $dbChapter = NovelChapter::where('novel_id', $novel->id)
            ->where(function($q) use ($chapter) {
                $q->where('slug', $chapter);
                if (is_numeric($chapter)) $q->orWhere('chapter_number', (float) $chapter);
            })
            ->first();

        if ($dbChapter) {
            $dbChapter->increment('views_count');
            $dbChapter->load('images');

            // Isi chapter Novel sengaja live-only dari API.
            // Jangan simpan/update content ke database.
            $current = clone $dbChapter;
            try {
                $live = $api->chapter($novel->slug, $dbChapter->slug, $novel->api_base_url);
                $current->content = $live['content'] ?? '';
                $current->title = $live['title'] ?? $dbChapter->title;
            } catch (\Throwable $e) {
                $current->content = '';
            }

            $chapters = NovelChapter::where('novel_id', $novel->id)->orderBy('position')->orderBy('id')->get(['id','title','chapter_number','position','slug','created_at']);
        } else {
            $live = $api->chapter($novel->slug, $chapter, $novel->api_base_url);
            $norm = $api->normalizeChapter($live, 0);
            $current = (object) array_merge($norm, [
                'id' => 'live-' . $norm['slug'],
                'content' => $live['content'] ?? $norm['content'] ?? '',
                'images' => [],
                'comments' => [],
                'views_count' => 0,
            ]);
            try {
                $chapters = collect($api->chapters($novel->slug, $novel->api_base_url))->values()->map(fn($ch, $i) => $api->normalizeChapter($ch, $i))->values();
            } catch (\Throwable $e) {
                $chapters = collect([$current]);
            }
        }

        $orderedChapters = collect($chapters)->values();
        $currentIndex = $orderedChapters->search(function ($item) use ($current) {
            $itemSlug = is_array($item) ? ($item['slug'] ?? null) : ($item->slug ?? null);
            $itemId = is_array($item) ? ($item['id'] ?? null) : ($item->id ?? null);
            return ($itemSlug && $itemSlug === ($current->slug ?? null)) || ($itemId && $itemId === ($current->id ?? null));
        });
        $prev = $currentIndex !== false ? $orderedChapters->get($currentIndex - 1) : null;
        $next = $currentIndex !== false ? $orderedChapters->get($currentIndex + 1) : null;

        return Inertia::render('Novel/Read', [
            'manga' => $novel,
            'chapter' => $current,
            'prev' => $prev,
            'next' => $next,
            'chapters' => $chapters,
            'readChapterIds' => [],
        ]);
    }
    private function normalizeSynopsisForView(?string $html): string
    {
        $html = trim((string) $html);
        if ($html === '') {
            return '<p>Tidak ada sinopsis untuk judul ini.</p>';
        }

        // Keep valid paragraph HTML from the WordPress API.
        if (preg_match('~<p[\s>]~i', $html) || preg_match('~<br\s*/?>~i', $html)) {
            return $html;
        }

        $plain = trim(strip_tags(html_entity_decode($html, ENT_QUOTES | ENT_HTML5, 'UTF-8')));
        if ($plain === '') {
            return '<p>Tidak ada sinopsis untuk judul ini.</p>';
        }

        $parts = preg_split("~\n{2,}~", $plain);
        $parts = array_values(array_filter(array_map('trim', $parts)));

        // Fallback for old imported synopsis that was saved as one long text.
        if (count($parts) <= 1 && mb_strlen($plain) > 260) {
            $plain = preg_replace('~([.!?])\s+(?=[A-Z0-9“\"\'])~u', "$1\n\n", $plain);
            $parts = preg_split("~\n{2,}~", $plain);
            $parts = array_values(array_filter(array_map('trim', $parts)));
        }

        return collect($parts)->map(fn ($p) => '<p>' . e($p) . '</p>')->implode('');
    }

}
