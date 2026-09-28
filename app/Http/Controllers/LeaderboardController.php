<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    public function index()
    {
        // Subquery: highest episode number per anime (= the finale)
        $maxEpSub = DB::table('episodes as ep_max')
            ->select('ep_max.anime_id', DB::raw('MAX(ep_max.number) as max_ep'))
            ->groupBy('ep_max.anime_id');

        // Top 100 by COMPLETED series (user's last watched episode = finale of that anime)
        $topSeries = DB::table('users')
            ->select('users.id', 'users.name', 'users.username', 'users.avatar_url', 'users.badge')
            ->join('watch_histories', 'users.id', '=', 'watch_histories.user_id')
            ->join('episodes', 'watch_histories.episode_id', '=', 'episodes.id')
            ->joinSub($maxEpSub, 'me', fn($j) => $j->on('watch_histories.anime_id', '=', 'me.anime_id'))
            ->whereColumn('episodes.number', '>=', 'me.max_ep')
            ->groupBy('users.id', 'users.name', 'users.username', 'users.avatar_url', 'users.badge')
            ->selectRaw('COUNT(*) as series_count')
            ->selectRaw('(SELECT COUNT(*) FROM follows WHERE follows.following_id = users.id) as followers_count')
            ->selectRaw('(SELECT COUNT(*) FROM follows WHERE follows.follower_id  = users.id) as following_count')
            ->orderByRaw('COUNT(*) DESC')
            ->limit(100)
            ->get()
            ->map(fn($u) => [
                'id'              => $u->id,
                'name'            => $u->name,
                'username'        => $u->username,
                'avatar_url'      => $u->avatar_url,
                'badge'           => $u->badge,
                'series_count'    => (int) $u->series_count,
                'followers_count' => (int) $u->followers_count,
                'following_count' => (int) $u->following_count,
            ]);

        // Top 100 by total animes with any watch history
        $topEpisodes = DB::table('users')
            ->select('users.id', 'users.name', 'users.username', 'users.avatar_url', 'users.badge')
            ->join('watch_histories', 'users.id', '=', 'watch_histories.user_id')
            ->groupBy('users.id', 'users.name', 'users.username', 'users.avatar_url', 'users.badge')
            ->selectRaw('COUNT(watch_histories.id) as episode_count')
            ->selectRaw('(SELECT COUNT(*) FROM follows WHERE follows.following_id = users.id) as followers_count')
            ->selectRaw('(SELECT COUNT(*) FROM follows WHERE follows.follower_id  = users.id) as following_count')
            ->orderByRaw('COUNT(watch_histories.id) DESC')
            ->limit(100)
            ->get()
            ->map(fn($u) => [
                'id'              => $u->id,
                'name'            => $u->name,
                'username'        => $u->username,
                'avatar_url'      => $u->avatar_url,
                'badge'           => $u->badge,
                'episode_count'   => (int) $u->episode_count,
                'followers_count' => (int) $u->followers_count,
                'following_count' => (int) $u->following_count,
            ]);

        // Top 100 by character favorites count
        $topCharFavorites = DB::table('users')
            ->select('users.id', 'users.name', 'users.username', 'users.avatar_url', 'users.badge')
            ->join('character_favorites', 'users.id', '=', 'character_favorites.user_id')
            ->groupBy('users.id', 'users.name', 'users.username', 'users.avatar_url', 'users.badge')
            ->selectRaw('COUNT(character_favorites.character_id) as char_fav_count')
            ->selectRaw('(SELECT COUNT(*) FROM follows WHERE follows.following_id = users.id) as followers_count')
            ->selectRaw('(SELECT COUNT(*) FROM follows WHERE follows.follower_id  = users.id) as following_count')
            ->orderByRaw('COUNT(character_favorites.character_id) DESC')
            ->limit(100)
            ->get()
            ->map(fn($u) => [
                'id'              => $u->id,
                'name'            => $u->name,
                'username'        => $u->username,
                'avatar_url'      => $u->avatar_url,
                'badge'           => $u->badge,
                'char_fav_count'  => (int) $u->char_fav_count,
                'followers_count' => (int) $u->followers_count,
                'following_count' => (int) $u->following_count,
            ]);

        return Inertia::render('Leaderboard', [
            'topSeries'        => $topSeries,
            'topEpisodes'      => $topEpisodes,
            'topCharFavorites' => $topCharFavorites,
        ]);
    }
}
