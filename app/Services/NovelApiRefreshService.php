<?php

namespace App\Services;

use App\Models\Genre;
use App\Models\Novel;
use App\Models\NovelChapter;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class NovelApiRefreshService
{
    public function __construct(protected KiryuuNovelApiService $api)
    {
    }

    public function refreshMetadata(Novel $novel): array
    {
        $novel->forceFill([
            'api_sync_status' => 'running',
            'api_sync_error' => null,
        ])->save();

        try {
            $detail = $this->api->detail($novel->source_url ?: $novel->slug, $novel->api_base_url);
            $first = $detail['first_chapter'] ?? [];

            $novel->fill([
                'title' => $detail['title'] ?? $novel->title,
                'synopsis' => $detail['synopsis'] ?? $novel->synopsis,
                'status' => $detail['status'] ?? $novel->status,
                'type' => $detail['type'] ?? $novel->type,
                'author' => $detail['author'] ?? $novel->author,
                'artist' => $detail['artist'] ?? $novel->artist,
                'poster' => $detail['cover'] ?? $detail['poster'] ?? $novel->poster,
                'source_url' => $detail['source_url'] ?? $detail['url'] ?? $novel->source_url,
                'api_base_url' => $detail['api_base_url'] ?? $novel->api_base_url,
                'rating' => $detail['rating'] ?? $novel->rating,
                'release_year' => $detail['release_year'] ?? $novel->release_year,
                'first_chapter_slug' => $first['slug'] ?? (!empty($first['url']) ? basename(rtrim($first['url'], '/')) : $novel->first_chapter_slug),
                'first_chapter_title' => $first['title'] ?? $novel->first_chapter_title,
                'first_chapter_url' => $first['url'] ?? $novel->first_chapter_url,
                'last_synced_at' => now(),
                'last_api_synced_at' => now(),
                'api_sync_status' => 'success',
                'api_sync_error' => null,
                'api_sync_requested_at' => null,
            ]);
            $novel->save();

            $this->syncTerms($novel, $detail);

            Cache::forget('home_latest_novel_updates_v1');

            return [
                'success' => true,
                'metadata' => true,
            ];
        } catch (\Throwable $e) {
            $this->markFailed($novel, $e);
            throw $e;
        }
    }

    public function refreshChapters(Novel $novel): array
    {
        $novel->forceFill([
            'api_sync_status' => 'running',
            'api_sync_error' => null,
        ])->save();

        try {
            $chapters = $this->api->chapters($novel->slug, $novel->api_base_url);

            $added = 0;
            $seen = 0;

            foreach ($chapters as $i => $raw) {
                $chapter = $this->api->normalizeChapter($raw, $i);

                if (empty($chapter['slug'])) {
                    continue;
                }

                $seen++;

                $exists = NovelChapter::where('novel_id', $novel->id)
                    ->where('slug', $chapter['slug'])
                    ->exists();

                if ($exists) {
                    // Jangan overwrite chapter lama, cukup pertahankan data yang sudah ada.
                    continue;
                }

                NovelChapter::create([
                    'novel_id' => $novel->id,
                    'title' => $chapter['title'] ?? $chapter['slug'],
                    'slug' => $chapter['slug'],
                    'chapter_number' => $chapter['chapter_number'] ?? ($i + 1),
                    'position' => $chapter['position'] ?? ($i + 1),
                    'source_url' => $chapter['source_url'] ?? null,
                    // Isi chapter tetap live dari API dan tidak disimpan ke database.
                    'content' => null,
                ]);

                $added++;
            }

            $novel->forceFill([
                'last_synced_at' => now(),
                'last_api_synced_at' => now(),
                'api_sync_status' => 'success',
                'api_sync_error' => null,
                'api_sync_requested_at' => null,
            ])->save();

            Cache::forget('home_latest_novel_updates_v1');

            return [
                'success' => true,
                'chapters_seen' => $seen,
                'chapters_added' => $added,
            ];
        } catch (\Throwable $e) {
            $this->markFailed($novel, $e);
            throw $e;
        }
    }

    public function refresh(Novel $novel, bool $syncChapters = true): array
    {
        $metadata = $this->refreshMetadata($novel);
        $chapterResult = ['chapters_added' => 0, 'chapters_seen' => 0];

        if ($syncChapters) {
            $chapterResult = $this->refreshChapters($novel);
        }

        return [
            'success' => true,
            'metadata' => $metadata['metadata'] ?? true,
            'chapters' => $chapterResult['chapters_added'] ?? 0,
            'chapters_added' => $chapterResult['chapters_added'] ?? 0,
            'chapters_seen' => $chapterResult['chapters_seen'] ?? 0,
        ];
    }

    protected function syncTerms(Novel $novel, array $detail): void
    {
        $terms = array_merge($detail['genres'] ?? [], $detail['tags'] ?? []);
        $genreIds = [];

        foreach ($terms as $term) {
            if (is_array($term)) {
                $name = $term['name'] ?? $term['title'] ?? $term['label'] ?? null;
                $slug = $term['slug'] ?? null;
            } else {
                $name = $term;
                $slug = null;
            }

            $name = trim((string) $name);

            if ($name === '') {
                continue;
            }

            $genre = Genre::firstOrCreate(
                ['slug' => $slug ?: Str::slug($name)],
                ['name' => $name]
            );

            $genreIds[] = $genre->id;
        }

        if ($genreIds) {
            $novel->genres()->sync(array_values(array_unique($genreIds)));
        }
    }

    protected function markFailed(Novel $novel, \Throwable $e): void
    {
        $novel->forceFill([
            'api_sync_status' => 'failed',
            'api_sync_error' => Str::limit($e->getMessage(), 1000),
            'last_api_synced_at' => now(),
        ])->save();
    }

    public function markPending(Novel $novel): void
    {
        // Dipertahankan agar command lama tidak error, tapi admin panel sekarang tidak memakai antrean/cron.
        $novel->forceFill([
            'api_sync_status' => 'pending',
            'api_sync_error' => null,
            'api_sync_requested_at' => now(),
        ])->save();
    }
}
