<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect to Google OAuth.
     */
    public function redirectToGoogle()
    {
        $settings = $this->loadSettings();

        if (empty($settings['google_login_enabled'])) {
            abort(403, 'Google login is not enabled.');
        }

        // Override services config with values from settings.json so the
        // admin can rotate credentials without touching .env
        if (!empty($settings['google_client_id'])) {
            config([
                'services.google.client_id'     => $settings['google_client_id'],
                'services.google.client_secret' => $settings['google_client_secret'],
                'services.google.redirect'      => route('auth.google.callback'),
            ]);
        }

        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the callback from Google.
     */
    public function handleGoogleCallback()
    {
        $settings = $this->loadSettings();

        if (empty($settings['google_login_enabled'])) {
            abort(403, 'Google login is not enabled.');
        }

        if (!empty($settings['google_client_id'])) {
            config([
                'services.google.client_id'     => $settings['google_client_id'],
                'services.google.client_secret' => $settings['google_client_secret'],
                'services.google.redirect'      => route('auth.google.callback'),
            ]);
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Google login gagal. Silakan coba lagi.');
        }

        // Try to find by google_id first, then by email
        $user = User::where('google_id', $googleUser->getId())->first()
               ?? User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            // Link google_id if not set yet (email-matched existing account)
            if (!$user->google_id) {
                $user->update(['google_id' => $googleUser->getId()]);
            }
        } else {
            // Create a new user
            $name     = $googleUser->getName() ?: $googleUser->getNickname() ?: 'User';
            $username = $this->generateUsername($name);

            $user = User::create([
                'name'       => $name,
                'username'   => $username,
                'email'      => $googleUser->getEmail(),
                'google_id'  => $googleUser->getId(),
                'password'   => bcrypt(Str::random(32)), // unusable random password
                'avatar_url' => $googleUser->getAvatar(),
            ]);
        }

        Auth::login($user, remember: true);

        return redirect()->intended(route('dashboard'));
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private function loadSettings(): array
    {
        $defaults = ['google_login_enabled' => false, 'google_client_id' => '', 'google_client_secret' => ''];
        if (!Storage::disk('public')->exists('settings.json')) {
            return $defaults;
        }
        return array_merge($defaults, json_decode(Storage::disk('public')->get('settings.json'), true) ?? []);
    }

    private function generateUsername(string $name): string
    {
        // Transliterate, lowercase, strip non-alphanumeric, truncate
        $base = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name));
        if (strlen($base) < 3) {
            $base = 'user';
        }
        $username = substr($base, 0, 20);

        // Ensure uniqueness
        $original = $username;
        $counter  = 1;
        while (User::where('username', $username)->exists()) {
            $username = $original . $counter;
            $counter++;
        }

        return $username;
    }
}
