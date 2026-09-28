<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserProfileController extends Controller
{
    /**
     * Public profile page — viewable by anyone (if profile_public).
     */
    public function show(string $username)
    {
        $user = User::where('username', $username)->firstOrFail();

        if (!$user->profile_public && auth()->id() !== $user->id) {
            abort(403, 'Profil ini tidak publik.');
        }

        $animeBookmarks = $user->bookmarkedAnimes()
            ->with('genres')
            ->orderByDesc('bookmarks.created_at')
            ->get()
            ->map(fn($a) => [
                'id'             => 'anime-' . $a->id,
                'title'          => $a->title,
                'slug'           => $a->slug,
                'poster'         => $a->poster,
                'rating'         => $a->rating,
                'type'           => $a->type,
                'status'         => $a->status,
                'episodes_count' => $a->episodes_count,
                'genres'         => $a->genres->pluck('name'),
                'item_type'      => 'anime'
            ]);

        $mangaBookmarks = $user->bookmarkedMangas()
            ->with('genres')
            ->orderByDesc('manga_bookmarks.created_at')
            ->get()
            ->map(fn($m) => [
                'id'             => 'manga-' . $m->id,
                'title'          => $m->title,
                'slug'           => $m->slug,
                'poster'         => $m->poster,
                'rating'         => $m->rating,
                'type'           => $m->type,
                'status'         => $m->status,
                'chapters_count' => $m->chapters_count,
                'genres'         => $m->genres->pluck('name'),
                'item_type'      => 'manga'
            ]);

        $bookmarks = $animeBookmarks->concat($mangaBookmarks);

        $watchHistories = $user->watchHistories()
            ->with(['anime', 'episode'])
            ->get()
            ->map(fn($wh) => [
                'id'             => 'anime-' . $wh->id,
                'anime_id'       => $wh->anime_id,
                'title'          => $wh->anime?->title,
                'slug'           => $wh->anime?->slug,
                'poster'         => $wh->anime?->poster,
                'rating'         => $wh->anime?->rating,
                'type'           => $wh->anime?->type,
                'status'         => $wh->anime?->status,
                'episodes_count' => $wh->anime?->episodes_count,
                'last_episode'   => $wh->episode?->number,
                'updated_at'     => $wh->updated_at,
                'item_type'      => 'anime'
            ]);

        $mangaHistories = $user->mangaHistories()
            ->with(['manga', 'chapter'])
            ->get()
            ->map(fn($mh) => [
                'id'             => 'manga-' . $mh->id,
                'manga_id'       => $mh->manga_id,
                'title'          => $mh->manga?->title,
                'slug'           => $mh->manga?->slug,
                'poster'         => $mh->manga?->poster,
                'rating'         => $mh->manga?->rating,
                'type'           => $mh->manga?->type,
                'status'         => $mh->manga?->status,
                'last_chapter'   => $mh->chapter?->chapter_number,
                'updated_at'     => $mh->updated_at,
                'item_type'      => 'manga'
            ]);

        $combinedHistories = $watchHistories->concat($mangaHistories)->sortByDesc('updated_at')->values()->all();

        $commentCount = $user->comments()->count();
        $comments = $user->comments()
            ->with([
                'anime:id,title,slug,poster',
                'episode:id,number,anime_id',
                'episode.anime:id,title,slug,poster',
                'manga:id,title,slug,poster',
                'chapter:id,chapter_number,manga_id',
                'chapter.manga:id,title,slug,poster',
            ])
            ->limit(50)
            ->get()
            ->map(function ($c) {
                // Resolve anime source
                $anime  = $c->anime ?? $c->episode?->anime;
                // Resolve manga source
                $manga  = $c->manga ?? $c->chapter?->manga;
                // Determine type
                $type   = $manga ? 'manga' : ($anime ? 'anime' : null);

                return [
                    'id'         => $c->id,
                    'content'    => $c->content,
                    'created_at' => $c->created_at->diffForHumans(),
                    'type'       => $type,
                    'anime'      => $anime ? [
                        'title'  => $anime->title,
                        'slug'   => $anime->slug,
                        'poster' => $anime->poster,
                    ] : null,
                    'episode'    => $c->episode ? ['number' => $c->episode->number] : null,
                    'manga'      => $manga ? [
                        'title'  => $manga->title,
                        'slug'   => $manga->slug,
                        'poster' => $manga->poster,
                    ] : null,
                    'chapter'    => $c->chapter ? ['number' => $c->chapter->chapter_number] : null,
                ];
            });

        $watchedCount  = DB::table('watch_histories')
            ->join('episodes', 'watch_histories.episode_id', '=', 'episodes.id')
            ->joinSub(
                DB::table('episodes as ep_max')
                    ->select('ep_max.anime_id', DB::raw('MAX(ep_max.number) as max_ep'))
                    ->groupBy('ep_max.anime_id'),
                'me',
                fn($j) => $j->on('watch_histories.anime_id', '=', 'me.anime_id')
            )
            ->where('watch_histories.user_id', $user->id)
            ->whereColumn('episodes.number', '>=', 'me.max_ep')
            ->count();
        $bookmarkCount  = $user->bookmarkedAnimes()->count() + $user->bookmarkedMangas()->count();
        $episodeCount   = $user->watchHistories()->count();
        $followersCount = $user->followers()->count();
        $followingCount = $user->following()->count();
        $isFollowing    = auth()->check() && auth()->id() !== $user->id
                            ? auth()->user()->isFollowing($user)
                            : false;

        $characterFavorites = $user->favoritedCharacters()
            ->with('anime:id,title')
            ->get()
            ->map(fn($c) => [
                'id'          => $c->id,
                'name'        => $c->name,
                'slug'        => $c->slug,
                'image_url'   => $c->image_url,
                'role'        => $c->role,
                'anime_title' => $c->anime?->title,
            ]);

        return Inertia::render('User/Profile', [
            'profileUser' => [
                'id'             => $user->id,
                'name'           => $user->name,
                'username'       => $user->username,
                'avatar_url'     => $user->avatar_url,
                'cover_url'      => $user->cover_url,
                'bio'            => $user->bio,
                'badge'          => $user->badge,
                'profile_public' => $user->profile_public,
                'joined_at'      => $user->created_at->format('M Y'),
            ],
            'bookmarks'      => $bookmarks,
            'watchHistories' => $combinedHistories,
            'stats' => [
                'watched'   => $watchedCount,
                'bookmarks' => $bookmarkCount,
                'episodes'  => $episodeCount,
                'followers' => $followersCount,
                'following' => $followingCount,
                'comments'  => $commentCount,
            ],
            'comments'         => $comments,
            'characterFavorites' => $characterFavorites,
            'isOwner'          => auth()->id() === $user->id,
            'isFollowing'      => $isFollowing,
            'og' => [
                'title'       => $user->name . ' (@' . $user->username . ') - ' . config('app.name', 'Kurogaze'),
                'description' => Str::limit($user->bio ?? 'Lihat profil anime ' . $user->name . ' di ' . config('app.name', 'Kurogaze'), 160),
                'image'       => $user->avatar_url ? (Str::startsWith($user->avatar_url, 'http') ? $user->avatar_url : url('storage/' . $user->avatar_url)) : null,
                'url'         => request()->url(),
                'type'        => 'profile',
            ],
        ]);
    }

    /**
     * Own profile edit page.
     */
    public function edit(Request $request)
    {
        $user = $request->user();
        return Inertia::render('Profile/EditProfile', [
            'profileUser' => [
                'id'             => $user->id,
                'name'           => $user->name,
                'username'       => $user->username,
                'email'          => $user->email,
                'avatar_url'     => $user->avatar_url,
                'cover_url'      => $user->cover_url,
                'bio'            => $user->bio,
                'badge'          => $user->badge,
                'profile_public' => $user->profile_public ?? true,
            ],
        ]);
    }

    /**
     * Update name, username, bio, profile_public.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'           => 'required|string|max:100',
            'username'       => ['required','string','max:30','regex:/^[a-z0-9_]+$/i',
                                 Rule::unique('users')->ignore($user->id)],
            'bio'            => 'nullable|string|max:500',
            'profile_public' => 'boolean',
        ]);

        $user->update($data);

        return redirect()->back()->with('success', 'Profil berhasil diperbarui.');
    }

    /**
     * Upload avatar.
     */
    public function updateAvatar(Request $request)
    {
        $request->validate(['avatar' => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:2048']);

        $user = $request->user();

        // Delete old avatar if stored locally
        if ($user->avatar_url && !filter_var($user->avatar_url, FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($user->avatar_url);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar_url' => $path]);

        return redirect()->back()->with('success', 'Avatar berhasil diperbarui.');
    }

    /**
     * Upload cover banner.
     */
    public function updateCover(Request $request)
    {
        $request->validate(['cover' => 'required|image|mimes:jpg,jpeg,png,webp|max:4096']);

        $user = $request->user();

        if ($user->cover_url && !filter_var($user->cover_url, FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($user->cover_url);
        }

        $path = $request->file('cover')->store('covers', 'public');
        $user->update(['cover_url' => $path]);

        return redirect()->back()->with('success', 'Cover berhasil diperbarui.');
    }
}
