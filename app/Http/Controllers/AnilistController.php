<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AnilistController extends Controller
{
    private const ANILIST_API = 'https://graphql.anilist.co';

    /**
     * Search anime on AniList by title
     */
    public function search(Request $request)
    {
        $request->validate(['q' => 'required|string|min:2']);

        $query = '
            query ($search: String) {
                Page(page: 1, perPage: 10) {
                    media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
                        id
                        title {
                            romaji
                            english
                            native
                        }
                        coverImage {
                            extraLarge
                            large
                        }
                        format
                        seasonYear
                        averageScore
                        status
                    }
                }
            }
        ';

        try {
            $response = Http::withoutVerifying()->timeout(15)
                ->withHeaders(['Content-Type' => 'application/json', 'Accept' => 'application/json'])
                ->post(self::ANILIST_API, [
                    'query' => $query,
                    'variables' => ['search' => $request->q],
                ]);

            if ($response->failed()) {
                return response()->json(['error' => 'Gagal menghubungi AniList: ' . ($response->json('errors.0.message') ?? 'Unknown error')], 502);
            }

            $results = $response->json('data.Page.media') ?? [];
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal menghubungi AniList: ' . $e->getMessage()], 502);
        }

        return response()->json(collect($results)->map(fn($item) => [
            'id' => $item['id'],
            'title' => $item['title']['romaji'] ?? $item['title']['english'] ?? '',
            'title_english' => $item['title']['english'] ?? '',
            'poster' => $item['coverImage']['extraLarge'] ?? $item['coverImage']['large'] ?? '',
            'format' => $item['format'] ?? '',
            'year' => $item['seasonYear'] ?? '',
            'score' => $item['averageScore'] ? round($item['averageScore'] / 10, 1) : null,
            'status' => $item['status'] ?? '',
        ]));
    }

    /**
     * Fetch full anime details from AniList by ID
     */
    public function fetch(Request $request)
    {
        $request->validate(['id' => 'required|integer']);

        $query = '
            query ($id: Int) {
                Media(id: $id, type: ANIME) {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    description(asHtml: false)
                    coverImage {
                        extraLarge
                        large
                    }
                    bannerImage
                    format
                    status
                    episodes
                    seasonYear
                    averageScore
                    genres
                    studios(isMain: true) {
                        nodes {
                            name
                        }
                    }
                    trailer {
                        id
                        site
                    }
                    characters(sort: [ROLE, FAVOURITES_DESC], perPage: 25) {
                        edges {
                            role
                            node {
                                id
                                name {
                                    full
                                }
                                image {
                                    large
                                }
                                description(asHtml: false)
                                gender
                                age
                                bloodType
                            }
                        }
                    }
                    staff(sort: [RELEVANCE], perPage: 15) {
                        edges {
                            role
                            node {
                                name {
                                    full
                                }
                                image {
                                    large
                                }
                            }
                        }
                    }
                }
            }
        ';

        try {
            $response = Http::withoutVerifying()->timeout(15)
                ->withHeaders(['Content-Type' => 'application/json', 'Accept' => 'application/json'])
                ->post(self::ANILIST_API, [
                    'query' => $query,
                    'variables' => ['id' => (int) $request->id],
                ]);

            if ($response->failed()) {
                return response()->json(['error' => 'Gagal mengambil detail dari AniList.'], 502);
            }

            $media = $response->json('data.Media');
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal menghubungi AniList: ' . $e->getMessage()], 502);
        }
        if (!$media) {
            return response()->json(['error' => 'Anime not found'], 404);
        }

        // Build trailer URL
        $trailerUrl = null;
        if (isset($media['trailer']['id']) && isset($media['trailer']['site'])) {
            if ($media['trailer']['site'] === 'youtube') {
                $trailerUrl = 'https://www.youtube.com/watch?v=' . $media['trailer']['id'];
            }
        }

        // Map format to our type
        $typeMap = [
            'TV' => 'TV',
            'TV_SHORT' => 'TV',
            'MOVIE' => 'Movie',
            'SPECIAL' => 'Special',
            'OVA' => 'OVA',
            'ONA' => 'ONA',
            'MUSIC' => 'Music',
        ];

        // Map status
        $statusMap = [
            'FINISHED' => 'Completed',
            'RELEASING' => 'Ongoing',
            'NOT_YET_RELEASED' => 'Upcoming',
            'CANCELLED' => 'Cancelled',
            'HIATUS' => 'Hiatus',
        ];

        // Clean synopsis (remove HTML tags from AniList description)
        $synopsis = $media['description'] ?? '';
        $synopsis = strip_tags($synopsis);
        $synopsis = html_entity_decode($synopsis, ENT_QUOTES, 'UTF-8');
        $synopsis = preg_replace('/\n{3,}/', "\n\n", $synopsis);
        $synopsis = trim($synopsis);

        // Build characters
        $characters = [];
        foreach (($media['characters']['edges'] ?? []) as $i => $edge) {
            $node = $edge['node'];
            // Strip spoiler tags and HTML from description
            $charDesc = $node['description'] ?? '';
            $charDesc = preg_replace('/~![\s\S]*?!~/', '', $charDesc);
            $charDesc = strip_tags($charDesc);
            $charDesc = trim($charDesc) ?: null;

            $characters[] = [
                'anilist_id'  => $node['id'] ?? null,
                'name'        => $node['name']['full'] ?? '',
                'image_url'   => $node['image']['large'] ?? '',
                'role'        => $edge['role'] === 'MAIN' ? 'Main' : 'Supporting',
                'sort_order'  => $i,
                'description' => $charDesc,
                'gender'      => $node['gender'] ?? null,
                'age'         => $node['age'] ?? null,
                'blood_type'  => $node['bloodType'] ?? null,
            ];
        }

        // Build staff
        $staff = [];
        foreach (($media['staff']['edges'] ?? []) as $i => $edge) {
            $staff[] = [
                'name' => $edge['node']['name']['full'] ?? '',
                'image_url' => $edge['node']['image']['large'] ?? '',
                'position' => $edge['role'] ?? 'Staff',
                'sort_order' => $i,
            ];
        }

        // Studio
        $studio = null;
        $studios = $media['studios']['nodes'] ?? [];
        if (count($studios) > 0) {
            $studio = $studios[0]['name'];
        }

        $title = $media['title']['romaji'] ?? $media['title']['english'] ?? '';

        // Auto Translate Synopsis
        $indonesiaSynopsis = $this->translateToIndonesian($synopsis);

        return response()->json([
            'anilist_id'   => $media['id'],
            'title' => $title,
            'slug' => Str::slug($title),
            'synopsis' => $indonesiaSynopsis ?: $synopsis,
            'poster' => $media['coverImage']['extraLarge'] ?? $media['coverImage']['large'] ?? '',
            'type' => $typeMap[$media['format'] ?? ''] ?? 'TV',
            'status' => $statusMap[$media['status'] ?? ''] ?? 'Ongoing',
            'rating' => $media['averageScore'] ? round($media['averageScore'] / 10, 1) : null,
            'release_year' => $media['seasonYear'] ?? null,
            'studio' => $studio,
            'trailer_url' => $trailerUrl,
            'genres' => $media['genres'] ?? [],
            'characters' => $characters,
            'staff' => $staff,
        ]);
    }

    /**
     * Simple translation using Google Translate free API
     */
    private function translateToIndonesian($text, $isShort = false)
    {
        if (empty($text)) return '';
        
        try {
            // Using Google Translate free API (gtx)
            $response = Http::withoutVerifying()->timeout(5)
                ->get('https://translate.googleapis.com/translate_a/single', [
                    'client' => 'gtx',
                    'sl'     => 'en',
                    'tl'     => 'id',
                    'dt'     => 't',
                    'q'      => $text,
                ]);

            if ($response->ok()) {
                $result = $response->json();
                if (isset($result[0])) {
                    $translated = '';
                    foreach ($result[0] as $sentence) {
                        $translated .= $sentence[0] ?? '';
                    }
                    return $translated;
                }
            }
        } catch (\Exception $e) {
            // Fallback to original text on failure
        }

        return $text;
    }
}
