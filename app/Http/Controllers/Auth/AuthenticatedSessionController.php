<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
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

        // Fallback if no posters in DB
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

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'backgroundPosters' => $posters,
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $this->recordLoginInfo($request);

        if (auth()->user()->is_admin) {
            return redirect()->intended('/admin');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    private function recordLoginInfo(\Illuminate\Http\Request $request): void
    {
        $ua = $request->userAgent() ?? '';

        // Detect browser
        if (preg_match('/Edg\//i', $ua))          $browser = 'Edge';
        elseif (preg_match('/OPR|Opera/i', $ua))  $browser = 'Opera';
        elseif (preg_match('/Chrome/i', $ua))     $browser = 'Chrome';
        elseif (preg_match('/Firefox/i', $ua))    $browser = 'Firefox';
        elseif (preg_match('/Safari/i', $ua))     $browser = 'Safari';
        else                                       $browser = 'Browser';

        // Detect OS
        if (preg_match('/Windows NT 10/i', $ua))       $os = 'Windows 10/11';
        elseif (preg_match('/Windows NT 6\.3/i', $ua)) $os = 'Windows 8.1';
        elseif (preg_match('/Windows/i', $ua))         $os = 'Windows';
        elseif (preg_match('/iPhone/i', $ua))          $os = 'iPhone';
        elseif (preg_match('/iPad/i', $ua))            $os = 'iPad';
        elseif (preg_match('/Android/i', $ua))         $os = 'Android';
        elseif (preg_match('/Mac OS X/i', $ua))        $os = 'macOS';
        elseif (preg_match('/Linux/i', $ua))           $os = 'Linux';
        else                                           $os = 'Unknown OS';

        $user    = auth()->user();
        $history = $user->login_history ?? [];

        // Reset to empty when the list is already full (8 entries)
        if (count($history) >= 8) {
            $history = [];
        }

        array_unshift($history, [
            'ip'     => $request->ip(),
            'device' => "{$browser} on {$os}",
            'at'     => now()->toIso8601String(),
        ]);

        $user->update(['login_history' => $history]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
