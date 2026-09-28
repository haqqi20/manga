<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Anime;
use App\Models\Episode;
use App\Models\Genre;
use App\Models\Manga;
use App\Models\Chapter;
use App\Models\Novel;
use App\Models\NovelChapter;
use Inertia\Inertia;

class AnimeController extends Controller
{
    public function index()
    {
        $settings = [];
        if (file_exists(storage_path('app/settings.json'))) {
            $settings = json_decode(file_get_contents(storage_path('app/settings.json')), true) ?? [];
        }
        $sliderEnabled = $settings['hero_slider_enabled'] ?? true;

        $featured = [];
        if ($sliderEnabled) {
            $featured = \Illuminate\Support\Facades\Cache::remember('home_featured_v2', 3600, function () {
                return Anime::with('genres')
                    ->where('is_featured', true)
                    ->latest()
                    ->take(6)
                    ->get()
                    ->toArray();
            });
        }

        $latestUpdates = \Illuminate\Support\Facades\Cache::remember('home_latest_updates_v2', 600, function () {
            $animes = Anime::with(['genres', 'episodes' => function ($query) {
                $query->orderBy('number', 'desc');
            }])
                ->whereHas('episodes')
                ->orderByDesc(
                    Episode::select('created_at')
                        ->whereColumn('anime_id', 'animes.id')
                        ->orderByDesc('created_at')
                        ->limit(1)
                )
                ->take(9)
                ->get();

            return $animes->map(function ($anime) {
                $anime->setRelation('episodes', $anime->episodes->take(2));
                return $anime;
            })->toArray();
        });

        $popular = \Illuminate\Support\Facades\Cache::remember('home_popular_v4', 3600, function () {
            $fetchPopular = function ($callback = null) {
                $query = Anime::with(['genres', 'episodes' => function ($query) {
                    $query->orderBy('number', 'desc')->select('anime_id', 'number', 'created_at');
                }])->orderByDesc('views_count')->take(12);

                if ($callback) {
                    $callback($query);
                }

                return $query->get()->map(function ($anime) {
                    $latestEp = $anime->episodes->first();
                    $anime->episodes_count_display = $latestEp ? $latestEp->number : $anime->episodes_count;
                    $anime->latest_episode_at = $latestEp
                        ? $latestEp->created_at->toIso8601String()
                        : $anime->updated_at->toIso8601String();

                    $anime->unsetRelation('episodes');
                    $anime->episodes = $anime->episodes_count_display ?? 0;

                    return $anime;
                });
            };

            return [
                'All' => $fetchPopular()->toArray(),
                'Ongoing' => $fetchPopular(fn($q) => $q->where('status', 'Ongoing'))->toArray(),
                'Complete' => $fetchPopular(fn($q) => $q->whereIn('status', ['Completed', 'Complete', 'Tamat']))->toArray(),
                'Movie' => $fetchPopular(fn($q) => $q->where('type', 'Movie'))->toArray(),
            ];
        });

        $recommended = Anime::with('genres')->inRandomOrder()->take(12)->get();

        $popularFlat = collect($popular)->flatten(1)->unique('id');
        $animeIds = collect([
            ...(collect($featured)->pluck('id')),
            ...(collect($latestUpdates)->pluck('id')),
            ...($popularFlat->pluck('id')),
            ...($recommended->pluck('id'))
        ])->unique();

        $liveViews = \Illuminate\Support\Facades\DB::table('animes')
            ->whereIn('id', $animeIds)
            ->pluck('views_count', 'id');

        $applyLiveViews = function ($item) use ($liveViews) {
            if (is_object($item)) {
                $item->views_count = $liveViews->get($item->id, $item->views_count ?? 0);
            } elseif (is_array($item)) {
                $item['views_count'] = $liveViews->get($item['id'], $item['views_count'] ?? 0);
            }
            return $item;
        };

        $applyToCollection = function ($collection) use ($applyLiveViews) {
            return collect($collection)->map($applyLiveViews);
        };

        $popularWithViews = [];
        foreach ($popular as $key => $items) {
            $popularWithViews[$key] = $applyToCollection($items)->sortByDesc('views_count')->values()->all();
        }

        $trendingManga = \Illuminate\Support\Facades\Cache::remember('home_trending_manga_v1', 600, function () {
            return Manga::with(['genres', 'lastChapter'])
                ->where('is_featured', true)
                ->latest()
                ->take(12)
                ->get()
                ->toArray();
        });

        $latestMangaUpdates = \Illuminate\Support\Facades\Cache::remember('home_latest_manga_updates_v1', 600, function () {
            return Manga::with(['genres', 'lastChapter'])
                ->whereHas('chapters')
                ->orderByDesc(
                    Chapter::select('created_at')
                        ->whereColumn('manga_id', 'mangas.id')
                        ->orderByDesc('created_at')
                        ->limit(1)
                )
                ->take(9)
                ->get()
                ->toArray();
        });

        $popularManga = \Illuminate\Support\Facades\Cache::remember('home_popular_manga_v2', 600, function () {
            return Manga::with(['genres', 'lastChapter'])
                ->orderByDesc('views_count')
                ->take(12)
                ->get()
                ->toArray();
        });

        $popularNovels = \Illuminate\Support\Facades\Cache::remember('home_popular_novels_v1', 600, function () {
            return Novel::with(['genres', 'lastChapter'])
                ->orderByDesc('views_count')
                ->latest()
                ->take(12)
                ->get()
                ->toArray();
        });

        $latestNovelUpdates = \Illuminate\Support\Facades\Cache::remember('home_latest_novel_updates_v1', 600, function () {
            return Novel::with(['genres', 'lastChapter'])
                ->orderByDesc(
                    NovelChapter::select('created_at')
                        ->whereColumn('novel_id', 'novels.id')
                        ->orderByDesc('created_at')
                        ->limit(1)
                )
                ->latest()
                ->take(9)
                ->get()
                ->toArray();
        });

        return Inertia::render('Home', [
            'featured' => $applyToCollection($featured),
            'latestUpdates' => $applyToCollection($latestUpdates),
            'popular' => $popularWithViews,
            'recommended' => $applyToCollection($recommended),
            'popularManga' => $popularManga,
            'popularNovels' => $popularNovels,
            'trendingManga' => $trendingManga,
            'latestMangaUpdates' => $latestMangaUpdates,
            'latestNovelUpdates' => $latestNovelUpdates,
        ]);
    }

    public function show(Request $request, $slug)
    {
        $anime = \Illuminate\Support\Facades\Cache::remember('anime_show_slug_v2_' . $slug, 60, function () use ($slug) {
            return Anime::with(['genres', 'characters', 'staff', 'episodes' => function($q) {
                $q->orderBy('number', 'desc');
            }, 'comments' => function($q) {
                $q->whereNull('parent_id')->with(['user', 'replies.user'])->latest();
            }])->where('slug', $slug)->firstOrFail()->toArray();
        });

        \Illuminate\Support\Facades\DB::table('animes')->where('id', $anime['id'])->increment('views_count');
        $anime['views_count'] = ($anime['views_count'] ?? 0) + 1;

        $isBookmarked = false;
        if ($request->user()) {
            $isBookmarked = $request->user()->bookmarkedAnimes()->where('anime_id', $anime['id'])->exists();
        }

        return Inertia::render('Anime/Show', [
            'anime'        => $anime,
            'isBookmarked' => $isBookmarked,
            'comments'     => $anime['comments'] ?? [],
            'og' => [
                'title'       => ($anime['title'] ?? '') . ' - ' . config('app.name', 'Kurogaze'),
                'description' => Str::limit(strip_tags($anime['synopsis'] ?? ''), 160),
                'image'       => $anime['poster'] ?? null,
                'url'         => request()->url(),
                'type'        => 'video.tv_show',
            ],
        ]);
    }

    public function explore(Request $request)
    {
        $query = Anime::with('genres');

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('letter')) {
            if ($request->letter === '#') {
                $query->whereRaw("LEFT(title, 1) NOT REGEXP '[A-Za-z]'");
            } else {
                $query->where('title', 'like', $request->letter . '%');
            }
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('genre')) {
            $query->whereHas('genres', function ($q) use ($request) {
                $q->where('slug', $request->genre);
            });
        }

        switch ($request->sort) {
            case 'popular':
                $query->orderByDesc('views_count');
                break;
            case 'latest_update':
                $query->orderByDesc(
                    Episode::select('created_at')
                        ->whereColumn('anime_id', 'animes.id')
                        ->orderByDesc('created_at')
                        ->limit(1)
                );
                break;
            case 'rating':
                $query->orderByDesc('rating');
                break;
            case 'title':
                $query->orderBy('title');
                break;
            default:
                $query->latest();
        }

        $animes = $query->paginate(24)->withQueryString();
        $genres = Genre::orderBy('name')->get(['id', 'name', 'slug']);

        return Inertia::render('Explore', [
            'animes'  => $animes,
            'genres'  => $genres,
            'filters' => (object) $request->only(['search', 'sort', 'status', 'letter', 'genre']),
        ]);
    }

    public function movies(Request $request)
    {
        $query = Anime::with('genres')
            ->where(function($q) {
                $q->where('type', 'like', '%movie%')
                  ->orWhere('status', 'like', '%movie%');
            });

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('letter')) {
            if ($request->letter === '#') {
                $query->whereRaw("LEFT(title, 1) NOT REGEXP '[A-Za-z]'");
            } else {
                $query->where('title', 'like', $request->letter . '%');
            }
        }

        if ($request->filled('genre')) {
            $query->whereHas('genres', function ($q) use ($request) {
                $q->where('slug', $request->genre);
            });
        }

        switch ($request->sort) {
            case 'popular':
                $query->orderByDesc('views_count');
                break;
            case 'rating':
                $query->orderByDesc('rating');
                break;
            case 'title':
                $query->orderBy('title');
                break;
            default:
                $query->latest();
        }

        $animes = $query->paginate(24)->withQueryString();
        $genres = Genre::orderBy('name')->get(['id', 'name', 'slug']);

        return Inertia::render('Movies', [
            'animes'  => $animes,
            'genres'  => $genres,
            'filters' => (object) $request->only(['search', 'sort', 'letter', 'genre']),
        ]);
    }

    public function library(Request $request)
    {
        $user = $request->user();

        $animeBookmarks = $user->bookmarkedAnimes()->withCount('episodes')->get()->map(function ($anime) {
            return [
                'id' => 'anime-' . $anime->id,
                'real_id' => $anime->id,
                'title' => $anime->title,
                'slug' => $anime->slug,
                'image' => $anime->poster,
                'status' => $anime->status ?? 'Ongoing',
                'last_ep' => 'Eps. ' . $anime->episodes_count,
                'type' => 'anime'
            ];
        });

        $mangaBookmarks = $user->bookmarkedMangas()->withCount('chapters')->get()->map(function ($manga) {
            return [
                'id' => 'manga-' . $manga->id,
                'real_id' => $manga->id,
                'title' => $manga->title,
                'slug' => $manga->slug,
                'image' => $manga->poster,
                'status' => $manga->status ?? 'Ongoing',
                'last_ep' => 'Ch. ' . ($manga->chapters_count ?? 0),
                'type' => 'manga'
            ];
        });

        $bookmarks = collect($animeBookmarks)->merge($mangaBookmarks)->values()->toArray();

        $animeHistories = $user->watchHistories()->with(['anime', 'episode'])->get()->map(function ($h) {
            return [
                'id' => 'anime-' . $h->id,
                'title' => $h->anime?->title ?? 'Deleted Anime',
                'slug' => $h->anime?->slug ?? '#',
                'image' => $h->anime?->poster ?? '',
                'updated_at' => $h->updated_at,
                'read_time' => $h->updated_at->diffForHumans(),
                'last_read_ep' => 'Eps. ' . ($h->episode->number ?? '?'),
                'last_watched_number' => $h->episode->number ?? 1,
                'type' => 'anime',
                'url' => "/anime/" . ($h->anime->slug ?? '#') . "/episode/" . ($h->episode->number ?? 1),
            ];
        });

        $mangaHistories = $user->mangaHistories()->with(['manga', 'chapter'])->get()->map(function ($h) {
            return [
                'id' => 'manga-' . $h->id,
                'title' => $h->manga?->title ?? 'Deleted Manga',
                'slug' => $h->manga?->slug ?? '#',
                'image' => $h->manga?->poster ?? '',
                'updated_at' => $h->updated_at,
                'read_time' => $h->updated_at->diffForHumans(),
                'last_read_ep' => 'Ch. ' . ($h->chapter->chapter_number ?? '?'),
                'type' => 'manga',
                'url' => "/manga/" . ($h->manga->slug ?? '#') . "/chapter/" . ($h->chapter->chapter_number ?? 1),
            ];
        });

        $combinedHistories = collect($animeHistories)->merge($mangaHistories)
            ->sortByDesc('updated_at')
            ->values()
            ->toArray();

        return Inertia::render('Library', [
            'bookmarks' => $bookmarks,
            'readlist'  => [],
            'histories' => $combinedHistories,
        ]);
    }

    public function toggleBookmark(Request $request, Anime $anime)
    {
        $user = $request->user();
        $user->bookmarkedAnimes()->toggle($anime->id);

        return back()->with('success', 'Bookmark updated.');
    }

    public function searchSuggestions(Request $request)
    {
        $q = trim($request->input('q', ''));
        if (strlen($q) < 2) {
            return response()->json([]);
        }

        $animes = Anime::with('genres')
            ->where('title', 'like', '%' . $q . '%')
            ->orderByDesc('views_count')
            ->limit(5)
            ->get(['id', 'title', 'slug', 'poster', 'type', 'status'])
            ->map(function ($anime) {
                return [
                    'id'       => $anime->id,
                    'title'    => $anime->title,
                    'slug'     => $anime->slug,
                    'poster'   => $anime->poster,
                    'type'     => $anime->type,
                    'status'   => $anime->status,
                    'category' => 'anime',
                    'url'      => "/anime/{$anime->slug}",
                    'genres'   => $anime->genres->pluck('name')->take(2)->toArray(),
                ];
            });

        $mangas = Manga::with('genres')
            ->where('title', 'like', '%' . $q . '%')
            ->orderByDesc('views_count')
            ->limit(5)
            ->get(['id', 'title', 'slug', 'poster', 'type', 'status'])
            ->map(function ($manga) {
                return [
                    'id'       => $manga->id,
                    'title'    => $manga->title,
                    'slug'     => $manga->slug,
                    'poster'   => $manga->poster,
                    'type'     => $manga->type,
                    'status'   => $manga->status,
                    'category' => 'manga',
                    'url'      => "/manga/{$manga->slug}",
                    'genres'   => $manga->genres->pluck('name')->take(2)->toArray(),
                ];
            });

        return response()->json($animes->concat($mangas)->sortByDesc('views_count')->values());
    }
}