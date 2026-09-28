<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use App\Models\Novel;
use App\Models\NovelChapter;
use App\Services\KiryuuNovelApiService;
use App\Services\NovelApiRefreshService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class NovelController extends Controller
{
    public function index(Request $request)
    {
        $query = Novel::withCount('chapters');
        if ($request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }
        return Inertia::render('Admin/Novel/Index', [
            'novels' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => ['search' => $request->search],
            'syncStats' => [
                'pending' => Novel::where('api_sync_status', 'pending')->count(),
                'running' => Novel::where('api_sync_status', 'running')->count(),
                'failed' => Novel::where('api_sync_status', 'failed')->count(),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Novel/Create', ['genres' => Genre::all()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:500',
            'slug' => 'required|string|unique:novels,slug',
            'synopsis' => 'nullable|string',
            'status' => 'required|string',
            'source_url' => 'nullable|string',
            'api_base_url' => 'nullable|string',
            'type' => 'required|string',
            'author' => 'nullable|string',
            'artist' => 'nullable|string',
            'poster' => 'nullable',
            'is_featured' => 'boolean',
            'rating' => 'nullable|numeric|min:0|max:10',
            'release_year' => 'nullable|integer',
            'first_chapter_slug' => 'nullable|string',
            'first_chapter_title' => 'nullable|string',
            'first_chapter_url' => 'nullable|string',
            'genres' => 'array',
        ]);

        if ($request->hasFile('poster')) {
            $path = $request->file('poster')->store('posters/novel', 'public');
            $validated['poster'] = '/storage/' . $path;
        }

        $novel = Novel::create($validated);
        if ($request->has('genres')) {
            $novel->genres()->sync($request->genres);
        }
        Cache::forget('home_latest_novel_updates_v1');
        return redirect()->route('admin.novel.index')->with('success', 'Novel created successfully.');
    }

    public function edit(Novel $novel)
    {
        $novel->load(['genres', 'chapters' => fn($q) => $q->orderBy('position')->orderBy('id')]);
        return Inertia::render('Admin/Novel/Edit', ['novel' => $novel, 'genres' => Genre::all()]);
    }

    public function update(Request $request, Novel $novel)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:500',
            'slug' => 'required|string|unique:novels,slug,' . $novel->id,
            'synopsis' => 'nullable|string',
            'status' => 'required|string',
            'source_url' => 'nullable|string',
            'api_base_url' => 'nullable|string',
            'type' => 'required|string',
            'author' => 'nullable|string',
            'artist' => 'nullable|string',
            'poster' => 'nullable',
            'is_featured' => 'boolean',
            'rating' => 'nullable|numeric|min:0|max:10',
            'release_year' => 'nullable|integer',
            'first_chapter_slug' => 'nullable|string',
            'first_chapter_title' => 'nullable|string',
            'first_chapter_url' => 'nullable|string',
            'genres' => 'array',
        ]);
        if ($request->hasFile('poster')) {
            if ($novel->poster && !str_starts_with($novel->poster, 'http')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $novel->poster));
            }
            $path = $request->file('poster')->store('posters/novel', 'public');
            $validated['poster'] = '/storage/' . $path;
        } elseif (!$request->filled('poster')) {
            unset($validated['poster']);
        }
        $novel->update($validated);
        if ($request->has('genres')) {
            $novel->genres()->sync($request->genres);
        }
        Cache::forget('home_latest_novel_updates_v1');
        return redirect()->route('admin.novel.index')->with('success', 'Novel updated successfully.');
    }

    public function destroy(Novel $novel)
    {
        $novel->delete();
        Cache::forget('home_latest_novel_updates_v1');
        return redirect()->route('admin.novel.index')->with('success', 'Novel deleted successfully.');
    }

    public function toggleFeatured(Novel $novel)
    {
        $novel->update(['is_featured' => !$novel->is_featured]);
        return back()->with('success', 'Featured Novel updated.');
    }

    public function syncChapters(Request $request, Novel $novel, NovelApiRefreshService $refreshService)
    {
        return $this->refreshChapters($novel, $refreshService);
    }

    public function refreshFromApi(Novel $novel, NovelApiRefreshService $refreshService)
    {
        return $this->refreshBoth($novel, $refreshService);
    }

    public function refreshMetadata(Novel $novel, NovelApiRefreshService $refreshService)
    {
        try {
            $refreshService->refreshMetadata($novel);

            return back()->with('success', 'Metadata novel berhasil direfresh dari API.');
        } catch (\Throwable $e) {
            return back()->withErrors(['refresh' => 'Gagal refresh metadata novel. Detail: ' . $e->getMessage()]);
        }
    }

    public function refreshChapters(Novel $novel, NovelApiRefreshService $refreshService)
    {
        try {
            $result = $refreshService->refreshChapters($novel);

            return back()->with('success', 'Chapter novel berhasil direfresh. Chapter baru: ' . ($result['chapters_added'] ?? 0) . ' dari ' . ($result['chapters_seen'] ?? 0) . ' chapter API.');
        } catch (\Throwable $e) {
            return back()->withErrors(['refresh' => 'Gagal refresh chapter novel. Detail: ' . $e->getMessage()]);
        }
    }

    public function refreshBoth(Novel $novel, NovelApiRefreshService $refreshService)
    {
        try {
            $result = $refreshService->refresh($novel, true);

            return back()->with('success', 'Novel berhasil direfresh dari API. Chapter baru: ' . ($result['chapters_added'] ?? $result['chapters'] ?? 0));
        } catch (\Throwable $e) {
            return back()->withErrors(['refresh' => 'Gagal refresh novel. Detail: ' . $e->getMessage()]);
        }
    }

    public function refreshSelected(Request $request, NovelApiRefreshService $refreshService)
    {
        $data = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:novels,id',
            'action' => 'nullable|string|in:metadata,chapters,both',
        ]);

        $action = $data['action'] ?? 'metadata';
        $success = 0;
        $failed = 0;
        $chapterAdded = 0;
        $errors = [];

        Novel::whereIn('id', $data['ids'])->get()->each(function (Novel $novel) use ($refreshService, $action, &$success, &$failed, &$chapterAdded, &$errors) {
            try {
                if ($action === 'chapters') {
                    $result = $refreshService->refreshChapters($novel);
                    $chapterAdded += (int) ($result['chapters_added'] ?? 0);
                } elseif ($action === 'both') {
                    $result = $refreshService->refresh($novel, true);
                    $chapterAdded += (int) ($result['chapters_added'] ?? $result['chapters'] ?? 0);
                } else {
                    $refreshService->refreshMetadata($novel);
                }

                $success++;
            } catch (\Throwable $e) {
                $failed++;
                $errors[] = $novel->title . ': ' . $e->getMessage();
            }
        });

        $message = $success . ' novel berhasil diproses.';
        if ($action !== 'metadata') {
            $message .= ' Chapter baru: ' . $chapterAdded . '.';
        }
        if ($failed > 0) {
            return back()
                ->with('success', $message . ' Gagal: ' . $failed . '.')
                ->withErrors(['refresh' => implode("\n", array_slice($errors, 0, 5))]);
        }

        return back()->with('success', $message);
    }

    public function refreshAll(Request $request)
    {
        return back()->withErrors([
            'refresh' => 'Refresh All otomatis/cron sudah dinonaktifkan. Pilih beberapa novel lalu gunakan Refresh Selected agar proses hanya jalan saat diklik.',
        ]);
    }

    public function chapters(Novel $novel)
    {
        return Inertia::render('Admin/Novel/Chapters/Index', [
            'novel' => $novel,
            'chapters' => $novel->chapters()->orderBy('position')->orderBy('id')->paginate(30),
        ]);
    }
}
