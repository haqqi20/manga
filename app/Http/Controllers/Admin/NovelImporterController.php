<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use App\Models\Novel;
use App\Models\NovelChapter;
use App\Services\KiryuuNovelApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;

class NovelImporterController extends Controller
{
    public function index(KiryuuNovelApiService $api)
    {
        return Inertia::render('Admin/Novel/Import', [
            'novelSettings' => [
                'source_domain' => $api->sourceDomain(),
                'api_base_url' => $api->defaultBaseUrl(),
                'chapter_mode' => $api->settings()['novel_chapter_mode'] ?? 'live_api',
            ],
        ]);
    }

    public function fetch(Request $request, KiryuuNovelApiService $api)
    {
        $request->validate([
            'url' => 'required|string',
            'api_base_url' => 'nullable|string',
            'load_chapters' => 'nullable|boolean',
        ]);

        try {
            $detail = $api->detail($request->url, $request->api_base_url);
            $chapters = [];
            if ($request->boolean('load_chapters')) {
                $chapters = collect($api->chapters($detail['slug'], $detail['api_base_url']))
                    ->values()
                    ->map(fn($ch, $i) => $api->normalizeChapter($ch, $i))
                    ->all();
            }

            return response()->json([
                'title' => $detail['title'] ?? '',
                'slug' => $detail['slug'] ?? Str::slug($detail['title'] ?? ''),
                'synopsis' => $detail['synopsis'] ?? $detail['description'] ?? '',
                'status' => $detail['status'] ?? 'Ongoing',
                'type' => $detail['type'] ?? 'Jepang',
                'author' => $detail['author'] ?? '',
                'artist' => $detail['artist'] ?? '',
                'poster' => $detail['cover'] ?? $detail['poster'] ?? '',
                'source_url' => $detail['source_url'] ?? $detail['url'] ?? $request->url,
                'api_base_url' => $detail['api_base_url'],
                'rating' => $detail['rating'] ?? 0,
                'release_year' => $detail['release_year'] ?? null,
                'genres' => $detail['genres'] ?? [],
                'tags' => $detail['tags'] ?? [],
                'first_chapter' => $detail['first_chapter'] ?? null,
                'chapters' => $chapters,
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Gagal mengambil data novel. Detail: ' . $e->getMessage()], 422);
        }
    }

    public function store(Request $request, KiryuuNovelApiService $api)
    {
        try {
            $payload = $request->all();

            // Normalize fields coming from WP API so validation and DB save do not fail.
            $payload['slug'] = Str::slug($payload['slug'] ?? $payload['title'] ?? '');
            $payload['synopsis'] = $api->normalizeSynopsis($payload['synopsis'] ?? $payload['description'] ?? '');
            $payload['author'] = $payload['author'] ?? $api->namesToString($payload['authors'] ?? []);
            $payload['artist'] = $payload['artist'] ?? $api->namesToString($payload['artists'] ?? []);
            $payload['genres'] = $api->normalizeTerms($payload['genres'] ?? []);
            $payload['tags'] = $api->normalizeTerms($payload['tags'] ?? []);
            $payload['type'] = $api->detectOriginFromTerms($payload['tags'], $payload['genres'], $payload['type'] ?? null);
            $payload['rating'] = $api->nullableFloat($payload['rating'] ?? null);
            $payload['release_year'] = $api->normalizeYear($payload['release_year'] ?? $payload['release'] ?? null);

            $request->replace($payload);

            $data = $request->validate([
                'title' => 'required|string',
                'slug' => 'required|string',
                'synopsis' => 'nullable|string',
                'status' => 'nullable|string',
                'type' => 'nullable|string',
                'tags' => 'nullable|array',
                'author' => 'nullable|string',
                'artist' => 'nullable|string',
                'poster' => 'nullable|string',
                'source_url' => 'nullable|string',
                'api_base_url' => 'nullable|string',
                'rating' => 'nullable|numeric',
                'release_year' => 'nullable|integer',
                'genres' => 'nullable|array',
                'first_chapter' => 'nullable|array',
                'import_chapters' => 'nullable|boolean',
                'import_chapter_content' => 'nullable|boolean',
            ]);

            $first = $data['first_chapter'] ?? [];
            $novel = Novel::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'title' => $data['title'],
                    'synopsis' => $data['synopsis'] ?? null,
                    'status' => $data['status'] ?? 'Ongoing',
                    'type' => $data['type'] ?? 'Jepang',
                    'author' => $data['author'] ?? null,
                    'artist' => $data['artist'] ?? null,
                    'poster' => $data['poster'] ?? null,
                    'source_url' => $data['source_url'] ?? null,
                    'api_base_url' => $data['api_base_url'] ?? null,
                    'rating' => $data['rating'] ?? null,
                    'release_year' => $data['release_year'] ?? null,
                    'first_chapter_slug' => $first['slug'] ?? (!empty($first['url']) ? basename(untrailingslashit($first['url'])) : null),
                    'first_chapter_title' => $first['title'] ?? null,
                    'first_chapter_url' => $first['url'] ?? null,
                    'last_synced_at' => now(),
                ]
            );

            $genreIds = [];
            foreach (array_merge($data['genres'] ?? [], $data['tags'] ?? []) as $name) {
                if (is_array($name)) $name = $name['name'] ?? $name['title'] ?? null;
                if (!$name) continue;
                $genre = Genre::firstOrCreate(['slug' => Str::slug($name)], ['name' => $name]);
                $genreIds[] = $genre->id;
            }
            $novel->genres()->sync($genreIds);

            $savedChapters = 0;
            if ($request->boolean('import_chapters')) {
                $chapters = $api->chapters($novel->slug, $novel->api_base_url);
                foreach ($chapters as $i => $raw) {
                    $ch = $api->normalizeChapter($raw, $i);
                    if (empty($ch['slug'])) continue;

                    if ($request->boolean('import_chapter_content') && empty($ch['content'])) {
                        try {
                            $detail = $api->chapter($novel->slug, $ch['slug'], $novel->api_base_url);
                            $ch['content'] = $detail['content'] ?? null;
                        } catch (\Throwable $e) {
                            // Skip content for this chapter, but still save the chapter row.
                        }
                    }

                    NovelChapter::updateOrCreate(
                        ['novel_id' => $novel->id, 'slug' => $ch['slug']],
                        [
                            'title' => $ch['title'] ?? null,
                            'chapter_number' => $ch['chapter_number'] ?? ($i + 1),
                            'position' => $ch['position'] ?? ($i + 1),
                            'source_url' => $ch['source_url'] ?? null,
                            'content' => $ch['content'] ?? null,
                        ]
                    );
                    $savedChapters++;
                }
            }

            Cache::forget('home_latest_novel_updates_v1');
            return response()->json(['success' => true, 'novel' => $novel, 'saved_chapters' => $savedChapters]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Gagal menyimpan novel. Detail: ' . $e->getMessage()], 422);
        }
    }
}
