<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Manga;
use App\Models\Chapter;
use App\Models\Genre;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PublicMangaController extends Controller
{
    public function index(Request $request)
    {
        $query = Manga::with(['genres', 'lastChapter']);

        // Search
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Letter Filter
        if ($request->filled('letter')) {
            $letter = $request->letter;
            if ($letter === '#') {
                $query->whereRaw('title REGEXP "^[^a-zA-Z]"');
            } else {
                $query->where('title', 'like', $letter . '%');
            }
        }

        // Type
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Genre
        if ($request->filled('genre')) {
            if (is_array($request->genre)) {
                $query->whereHas('genres', function ($q) use ($request) {
                    $q->whereIn('slug', $request->genre);
                });
            } else {
                $query->whereHas('genres', function ($q) use ($request) {
                    $q->where('slug', $request->genre);
                });
            }
        }

        // Sorting
        switch ($request->sort) {
            case 'popular':
                $query->orderByDesc('views_count');
                break;

            case 'rating':
                $query->orderByDesc('rating');
                break;

            case 'new_manga':
                $query->latest();
                break;

            case 'title':
                $query->orderBy('title');
                break;

            case 'latest_update':
            default:
                $query->orderByDesc(
                    Chapter::select('created_at')
                        ->whereColumn('manga_id', 'mangas.id')
                        ->orderByDesc('created_at')
                        ->limit(1)
                )
                ->latest();
                break;
        }

        $mangas = $query->paginate(24)->withQueryString();
        $genres = Genre::all();

        return Inertia::render('Manga/Index', [
            'mangas' => $mangas,
            'genres' => $genres,
            'filters' => (object) $request->only(['search', 'type', 'status', 'genre', 'sort', 'letter'])
        ]);
    }

    public function show($slug)
    {
        $manga = Manga::with(['genres', 'chapters' => function($q) {
            $q->orderBy('chapter_number', 'desc');
        }, 'comments' => function($q) {
            $q->whereNull('parent_id')->with(['user', 'replies.user'])->latest();
        }])->where('slug', $slug)->firstOrFail();

        // Increment views
        $manga->increment('views_count');

        // Calculate Rank (based on views_count position)
        $mangaRank = Manga::where('views_count', '>', $manga->views_count)->count() + 1;

        // First Chapter
        $firstChapter = $manga->chapters->sortBy('chapter_number')->first();

        // Related Mangas (By shared genres, sorted by relevance)
        $relatedMangas = collect();
        if ($manga->genres->count() > 0) {
            $genreIds = $manga->genres->pluck('id')->toArray();

            $relatedMangas = Manga::with(['lastChapter', 'genres'])
                ->whereHas('genres', function($q) use ($genreIds) {
                    $q->whereIn('genres.id', $genreIds);
                })
                ->where('id', '!=', $manga->id)
                ->withCount(['genres as shared_genres_count' => function($q) use ($genreIds) {
                    $q->whereIn('genres.id', $genreIds);
                }])
                ->orderByDesc('shared_genres_count')
                ->orderByDesc('views_count')
                ->limit(8)
                ->get();
        }

        $isBookmarked = false;
        if (auth()->check()) {
            $isBookmarked = auth()->user()->bookmarkedMangas()->where('manga_id', $manga->id)->exists();
        }

        $readChapterIds = [];
        if (auth()->check()) {
            $readChapterIds = auth()->user()->mangaHistories()
                ->where('manga_id', $manga->id)
                ->pluck('chapter_id')
                ->toArray();
        }

        return Inertia::render('Manga/Show', [
            'manga' => $manga,
            'mangaRank' => $mangaRank,
            'firstChapter' => $firstChapter,
            'relatedMangas' => $relatedMangas,
            'isBookmarked' => $isBookmarked,
            'readChapterIds' => $readChapterIds,
            'userRating' => 0,
            'totalRaters' => rand(100, 500)
        ]);
    }

    public function toggleBookmark($slug)
    {
        $manga = Manga::where('slug', $slug)->firstOrFail();
        auth()->user()->bookmarkedMangas()->toggle($manga->id);
        return back()->with('success', 'Bookmark updated.');
    }

    public function rate(Request $request, $slug)
    {
        $request->validate([
            'rating' => 'required|numeric|min:0|max:10',
        ]);

        $manga = Manga::where('slug', $slug)->firstOrFail();
        $manga->update(['rating' => $request->rating]);

        return back()->with('success', 'Terima kasih atas ratingnya!');
    }

    public function read($slug, $chapter_number)
    {
        $manga = Manga::where('slug', $slug)->firstOrFail();

        $chapter = Chapter::with(['images', 'comments' => function($q) {
            $q->whereNull('parent_id')->with(['user', 'replies.user'])->latest();
        }])
            ->where('manga_id', $manga->id)
            ->where('chapter_number', $chapter_number)
            ->firstOrFail();

        // Increment chapter views
        $chapter->increment('views_count');
        $manga->increment('views_count');

        // Store History
        if (auth()->check()) {
            \App\Models\MangaHistory::updateOrCreate(
                ['user_id' => auth()->id(), 'manga_id' => $manga->id],
                ['chapter_id' => $chapter->id, 'updated_at' => now()]
            );
        }

        // Navigation Prev/Next
        $prev = Chapter::where('manga_id', $manga->id)
            ->where('chapter_number', '<', $chapter_number)
            ->orderBy('chapter_number', 'desc')
            ->first();

        $next = Chapter::where('manga_id', $manga->id)
            ->where('chapter_number', '>', $chapter_number)
            ->orderBy('chapter_number', 'asc')
            ->first();

        $chapters = Chapter::where('manga_id', $manga->id)
            ->orderBy('chapter_number', 'desc')
            ->get(['id', 'title', 'chapter_number', 'slug', 'created_at']);

        $readChapterIds = [];
        if (auth()->check()) {
            $readChapterIds = auth()->user()->mangaHistories()
                ->where('manga_id', $manga->id)
                ->pluck('chapter_id')
                ->toArray();
        }

        return Inertia::render('Manga/Read', [
            'manga' => $manga,
            'chapter' => $chapter,
            'prev' => $prev,
            'next' => $next,
            'chapters' => $chapters,
            'readChapterIds' => $readChapterIds
        ]);
    }
}