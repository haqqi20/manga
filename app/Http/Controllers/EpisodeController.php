<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Episode;
use App\Models\Anime;
use App\Models\WatchHistory;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EpisodeController extends Controller
{
    public function show($slug, $number)
    {
        $anime = \Illuminate\Support\Facades\Cache::remember('episode_anime_v2_' . $slug, 600, function () use ($slug) {
            return Anime::where('slug', $slug)
                ->with(['genres', 'episodes' => function ($q) {
                    $q->orderBy('number', 'asc');
                }])
                ->firstOrFail()
                ->toArray();
        });

        $episode = \Illuminate\Support\Facades\Cache::remember('episode_detail_v2_' . $anime['id'] . '_' . $number, 3600, function () use ($anime, $number) {
            return Episode::where('anime_id', $anime['id'])
                ->with(['comments' => function($q) {
                    $q->whereNull('parent_id')->with(['user', 'replies.user'])->latest();
                }])
                ->where('number', $number)
                ->firstOrFail()
                ->toArray();
        });

        // Increment anime views count
        \Illuminate\Support\Facades\DB::table('animes')->where('id', $anime['id'])->increment('views_count');

        if (Auth::check()) {
            WatchHistory::updateOrCreate(
                [
                    'user_id' => Auth::id(),
                    'anime_id' => $anime['id'],
                ],
                [
                    'episode_id' => $episode['id'],
                    'updated_at' => now(),
                ]
            );
        }

        return Inertia::render('Anime/Player', [
            'anime'        => $anime,
            'episode'      => $episode,
            'allEpisodes'  => $anime['episodes'] ?? [],
            'comments'     => $episode['comments'] ?? [],
            'isBookmarked' => Auth::check()
                ? Auth::user()->bookmarkedAnimes()->where('anime_id', $anime['id'])->exists()
                : false,
        ]);
    }
}
