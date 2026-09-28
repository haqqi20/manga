<?php

namespace App\Http\Controllers;

use App\Models\Anime;
use App\Models\Character;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CharacterController extends Controller
{
    public function show(int $id, ?string $slug = null)
    {
        $character = Character::with(['anime.genres', 'anime.characters'])
            ->withCount('favoritedByUsers')
            ->findOrFail($id);

        $isFavorited = Auth::check()
            ? Auth::user()->favoritedCharacters()->where('character_id', $character->id)->exists()
            : false;

        $siteSlug = config('site.slug', 'anime');
        if (file_exists(storage_path('app/settings.json'))) {
            $j = json_decode(file_get_contents(storage_path('app/settings.json')), true);
            if (!empty($j['site_slug'])) {
                $siteSlug = $j['site_slug'];
            }
        }

        // Primary anime (used for banner + co-characters)
        $anime = $character->anime ? [
            'id'           => $character->anime->id,
            'title'        => $character->anime->title,
            'slug'         => $character->anime->slug,
            'poster'       => $character->anime->poster,
            'type'         => $character->anime->type,
            'status'       => $character->anime->status,
            'rating'       => $character->anime->rating,
            'genres'       => $character->anime->genres->pluck('name'),
            'release_year' => $character->anime->release_year,
            'studio'       => $character->anime->studio,
        ] : null;

        // All anime this character appears in — match via anilist_id
        $mapAnime = fn($a) => [
            'id'           => $a->id,
            'title'        => $a->title,
            'slug'         => $a->slug,
            'poster'       => $a->poster,
            'type'         => $a->type,
            'status'       => $a->status,
            'rating'       => $a->rating,
            'genres'       => $a->genres->pluck('name'),
            'release_year' => $a->release_year,
            'studio'       => $a->studio,
        ];

        if ($character->anilist_id) {
            // Step 1: find appearances via character records already in DB
            $dbAppearances = Character::with(['anime.genres'])
                ->where('anilist_id', $character->anilist_id)
                ->whereHas('anime')
                ->get()
                ->map(fn($c) => $c->anime)
                ->unique('id');

            // Step 2: query AniList API for all media this character appears in
            $anilistMediaIds = $this->fetchCharacterMediaIds($character->anilist_id);

            // Step 3: look up any animes in OUR DB matched by anilist_id that aren't already found
            $existingAnimeIds = $dbAppearances->pluck('id');
            $apiAppearances = $anilistMediaIds
                ? Anime::with('genres')
                    ->whereIn('anilist_id', $anilistMediaIds)
                    ->whereNotIn('id', $existingAnimeIds)
                    ->get()
                : collect();

            $appearances = $dbAppearances->merge($apiAppearances)
                ->unique('id')
                ->sortBy('release_year')
                ->map($mapAnime)
                ->values();
        } else {
            $appearances = $character->anime
                ? collect([$mapAnime($character->anime)])
                : collect();
        }

        // Other characters in the same (primary) anime
        $coCharacters = $character->anime
            ? $character->anime->characters
                ->where('id', '!=', $character->id)
                ->take(12)
                ->map(fn($c) => [
                    'id'        => $c->id,
                    'name'      => $c->name,
                    'slug'      => $c->slug,
                    'image_url' => $c->image_url,
                    'role'      => $c->role,
                ])
                ->values()
            : collect();

        return Inertia::render('Anime/Character', [
            'character' => [
                'id'          => $character->id,
                'name'        => $character->name,
                'slug'        => $character->slug,
                'anilist_id'  => $character->anilist_id,
                'image_url'   => $character->image_url,
                'description' => $character->description,
                'role'        => $character->role,
                'gender'      => $character->gender,
                'age'         => $character->age,
                'blood_type'  => $character->blood_type,
            ],
            'anime'        => $anime,
            'appearances'  => $appearances,
            'coCharacters' => $coCharacters,
            'siteSlug'     => $siteSlug,
            'isFavorited'   => $isFavorited,
            'favoriteCount' => $character->favorited_by_users_count,
            'og' => [
                'title'       => $character->name . ($anime ? ' \u2014 ' . $anime['title'] : '') . ' - ' . config('app.name', 'Kurogaze'),
                'description' => Str::limit(strip_tags($character->description ?? 'Karakter anime ' . $character->name), 160),
                'image'       => $character->image_url,
                'url'         => request()->url(),
                'type'        => 'profile',
            ],
        ]);
    }

    public function toggleFavorite(Request $request, int $id)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
        $character = Character::findOrFail($id);
        $user = Auth::user();
        $user->favoritedCharacters()->toggle($character->id);
        $isFavorited = $user->favoritedCharacters()->where('character_id', $character->id)->exists();
        return back()->with('isFavorited', $isFavorited);
    }

    /**
     * Fetch all AniList media IDs for a character from the AniList API.
     * Returns an array of integer media IDs, or null on failure.
     */
    private function fetchCharacterMediaIds(int $anilistCharacterId): ?array
    {
        $query = <<<'GQL'
        query ($id: Int) {
          Character(id: $id) {
            media(perPage: 25, sort: START_DATE) {
              nodes { id }
            }
          }
        }
        GQL;

        try {
            $response = Http::timeout(5)->post('https://graphql.anilist.co', [
                'query'     => $query,
                'variables' => ['id' => $anilistCharacterId],
            ]);

            if ($response->successful()) {
                $nodes = $response->json('data.Character.media.nodes') ?? [];
                return array_column($nodes, 'id');
            }
        } catch (\Throwable) {
            // Silently ignore network/timeout errors — DB appearances still shown
        }

        return null;
    }
}
