<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserSettingsController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $user = $request->user();

        // Count completed series
        $watchedCount = DB::table('watch_histories')
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

        $stats = [
            'watched'    => $watchedCount,
            'episodes'   => $user->watchHistories()->count(),
            'bookmarks'  => $user->bookmarkedAnimes()->count(),
            'charFavs'   => $user->favoritedCharacters()->count(),
            'followers'  => $user->followers()->count(),
            'following'  => $user->following()->count(),
        ];

        return Inertia::render('Dashboard', [
            'user'      => $user->only('id', 'name', 'username', 'email', 'avatar_url', 'badge', 'cover_url',
                                        'login_history'),
            'stats'     => $stats,
            'status'    => session('status'),
        ]);
    }

    public function index(Request $request): Response
    {
        return Inertia::render('User/Settings', [
            'user'   => $request->user()->only('id', 'name', 'username', 'email', 'avatar_url'),
            'status' => session('status'),
        ]);
    }

    public function updateEmail(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'email'            => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'current_password' => ['required', 'current_password'],
        ]);

        $user->email = $validated['email'];
        $user->email_verified_at = null;
        $user->save();

        return back()->with('status', 'email-updated');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('status', 'password-updated');
    }
}
