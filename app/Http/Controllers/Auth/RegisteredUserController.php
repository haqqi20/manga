<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        $posters = \Illuminate\Support\Facades\Cache::remember('auth_background_posters', 3600, function () {
            return \App\Models\Anime::whereNotNull('poster')
                ->latest()
                ->take(12)
                ->pluck('poster')
                ->toArray();
        });

        // Fallback
        if (empty($posters)) {
            $posters = [
                'https://cdn.myanimelist.net/images/anime/1100/138338.jpg',
                'https://cdn.myanimelist.net/images/anime/1015/138006.jpg',
                'https://cdn.myanimelist.net/images/anime/1908/135431.jpg',
                'https://cdn.myanimelist.net/images/anime/1806/126216.jpg',
                'https://cdn.myanimelist.net/images/anime/1935/127974.jpg',
                'https://cdn.myanimelist.net/images/anime/1122/96435.jpg',
                'https://cdn.myanimelist.net/images/anime/1439/93480.jpg',
                'https://cdn.myanimelist.net/images/anime/1337/99013.jpg',
                'https://cdn.myanimelist.net/images/anime/1079/138156.jpg',
                'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
                'https://cdn.myanimelist.net/images/anime/1764/126627.jpg',
                'https://cdn.myanimelist.net/images/anime/1160/122627.jpg',
            ];
        }

        return Inertia::render('Auth/Register', [
            'backgroundPosters' => $posters,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
