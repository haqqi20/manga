<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use App\Models\Anime;
use App\Models\Genre;
use App\Models\Episode;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class OtakudesuService
{
    protected string $baseUrl;

    public function __construct()
    {
        // Use the new Satulagi API
        $this->baseUrl = 'https://api.satulagi.my.id';
    }

    /**
     * Sync the latest ongoing animes from the homepage.
     */
    public function syncLatestOngoing()
    {
        try {
            set_time_limit(300); // Allow 5 minutes for full sync

            $response = Http::withoutVerifying()->timeout(30)->get("{$this->baseUrl}/api/home");
            
            if (!$response->successful()) {
                Log::error("Failed to fetch from Otakudesu API", ['status' => $response->status()]);
                return false;
            }

            $data = $response->json();
            $ongoingAnimes = $data['ongoing_anime'] ?? [];
            if (empty($ongoingAnimes) && is_array($data) && isset($data[0])) {
                $ongoingAnimes = $data; // Sometimes it's a flat array
            }
            
            Log::info("Otakudesu Sync: Found " . count($ongoingAnimes) . " ongoing animes.", ['sample' => array_slice($ongoingAnimes, 0, 1)]);

            $syncedCount = 0;

            foreach ($ongoingAnimes as $item) {
                $slug = $item['slug'] ?? null;
                
                if (!$slug) {
                    Log::warning("Otakudesu Sync: Item missing slug: " . json_encode($item));
                    continue;
                }

                // Sync individual anime details to get full info and episodes
                Log::info("Otakudesu Sync: Processing slug '$slug'");
                if ($this->syncAnimeDetail($slug)) {
                    $syncedCount++;
                    Log::info("Otakudesu Sync: Successfully synced '$slug'");
                } else {
                    Log::error("Otakudesu Sync: Failed to sync '$slug'");
                }
            }

            return $syncedCount;

        } catch (\Exception $e) {
            Log::error("Otakudesu API Sync Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Fetch and save anime detail by slug, including genres and episodes.
     */
    public function syncAnimeDetail(string $slug)
    {
        try {
            $response = Http::withoutVerifying()
                ->timeout(30)->get("{$this->baseUrl}/api/anime/{$slug}");
            
            if (!$response->successful()) {
                return false;
            }

            $animeData = $response->json();
            
            if (!$animeData || !isset($animeData['title'])) {
                Log::warning("Otakudesu Sync: Missing anime title for slug {$slug}");
                return false;
            }

            // --- 1. Save or Update Anime ---
            // Extract attributes safely
            $title = $animeData['title'];
            $synopsis = $animeData['synopsis'] ?? null;
            if (is_array($synopsis)) {
                 $synopsis = implode("\n", $synopsis);
            }

            $poster = $animeData['thumbnail'] ?? null;
            $status = $animeData['status'] ?? 'Ongoing';
            $rating = $animeData['score'] ?? null;
            
            if (empty($rating) || $rating === '?' || $rating === 'Unknown') {
                $rating = null;
            } else {
                preg_match('/(\d+(\.\d+)?)/', $rating, $matches);
                $rating = isset($matches[1]) ? (float)$matches[1] : null;
            }
            
            $studio = $animeData['studio'] ?? null;
            $release_year = $animeData['release_date'] ?? null;
            if ($release_year) {
                preg_match('/\b(19|20)\d{2}\b/', $release_year, $matches);
                $release_year = $matches[0] ?? null;
            }

            $anime = Anime::updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $title,
                    'synopsis' => $synopsis,
                    'status' => $status,
                    'poster' => $poster,
                    'rating' => $rating,
                    'studio' => $studio,
                    'release_year' => $release_year,
                ]
            );

            // --- 2. Attach Genres ---
            $genreList = $animeData['genres'] ?? [];
            $genreIds = [];
            foreach ($genreList as $genreItem) {
                $genreName = $genreItem['name'] ?? null;
                $genreSlug = $genreItem['slug'] ?? Str::slug($genreName);
                
                if ($genreName) {
                    $genre = Genre::firstOrCreate(
                        ['slug' => $genreSlug],
                        ['name' => $genreName]
                    );
                    $genreIds[] = $genre->id;
                }
            }
            
            if (!empty($genreIds)) {
                $anime->genres()->syncWithoutDetaching($genreIds);
            }

            // --- 3. Save Episodes ---
            $episodeList = $animeData['episode_list'] ?? [];
            foreach ($episodeList as $epItem) {
                $epTitle = $epItem['episode'] ?? 'Unknown';
                $epSlug = $epItem['slug'] ?? null;
                
                if (!$epSlug) continue;

                // Extract episode number from title or slug
                preg_match('/episode[s]?[- ]?(\d+(\.\d+)?)/i', $epSlug . ' ' . $epTitle, $matches);
                $epNumber = isset($matches[1]) ? (float)$matches[1] : 0;
                
                $existingEpisode = Episode::where('anime_id', $anime->id)->where('number', $epNumber)->first();
                $videoUrl = $existingEpisode ? $existingEpisode->video_url : null;

                Episode::updateOrCreate(
                    ['anime_id' => $anime->id, 'number' => $epNumber],
                    [
                        'title' => $epTitle,
                        'video_url' => $videoUrl,
                    ]
                );
            }

            return true;

        } catch (\Exception $e) {
            Log::error("Anime Detail Sync Error ({$slug}): " . $e->getMessage());
            return false;
        }
    }

    /**
     * Fetch the actual stream URL for a given episode slug.
     */
    protected function fetchEpisodeVideoUrl(string $epSlug)
    {
        try {
            // Wait 1 second to avoid hammering the API
            sleep(1); 
            $response = Http::withoutVerifying()
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'])
                ->timeout(15)->get("{$this->baseUrl}/api/episode/{$epSlug}");
            
            if (!$response->successful()) {
                return null;
            }

            $data = $response->json();
            // Otakudesu API typically provides a stream_url or mirrors. 
            // The exact key depends on the specific API implementation (zuruidesuotakuapi usually has `stream_url` or similar)
            
            // Let's use the first available stream URL or iframe link
            $streamUrl = $data['stream_url'] ?? null;
            
            // If stream_url is not directly available, check mirrors/downloads
            if (!$streamUrl && isset($data['download_urls'])) {
                // Try to find an mp4/mkv link or embed link
                // This is a simplified fallback
                 // We will just use the page itself as a fallback if no direct iframe is available
            }

            return [
                'video_url' => $streamUrl
            ];

        } catch (\Exception $e) {
            Log::error("Episode Video Sync Error ({$epSlug}): " . $e->getMessage());
            return null;
        }
    }
}
