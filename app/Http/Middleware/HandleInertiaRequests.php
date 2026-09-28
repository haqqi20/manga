<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Storage;
use App\Models\Report;
use Closure;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Handle the incoming request.
     *
     * Penting untuk Inertia + cache/CDN/browser:
     * header Vary: X-Inertia mencegah response JSON Inertia dipakai
     * sebagai response HTML saat halaman direload langsung.
     */
    public function handle($request, Closure $next)
    {
        $response = parent::handle($request, $next);

        $response->headers->set('Vary', 'X-Inertia');

        return $response;
    }

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Load custom settings
        $settingsPath = 'settings.json';
        $siteSettings = [
            'site_name'          => 'NekoNonton',
            'site_slug'          => 'anime',
            'favicon'            => null,
            'logo_icon'          => 'cat',
            'logo_color'         => '#ef4444',
            'footer_description' => '',
            'footer_copyright'   => '',
            'footer_credit'      => '',
            'nav_links'          => [
                ['label' => 'Beranda',       'href' => '/'],
                ['label' => 'Daftar Anime',  'href' => '/explore'],
                ['label' => 'Jadwal Rilis',  'href' => '/schedule'],
                ['label' => 'Request Anime', 'href' => '/request'],
            ],
            'legal_links'        => [
                ['label' => 'Terms of Service', 'href' => '/terms'],
                ['label' => 'Privacy Policy',   'href' => '/privacy'],
                ['label' => 'DMCA',             'href' => '/dmca'],
                ['label' => 'Kontak Kami',      'href' => '/contact'],
            ],
            'social_facebook'     => '',
            'social_twitter'      => '',
            'social_instagram'    => '',
            'show_visitor_stats'  => false,
            'discord_enabled'      => false,
            'discord_url'          => '',
            'discord_title'        => 'Join Our Discord',
            'discord_description'  => '',
            'google_login_enabled' => false,
            'google_client_id'     => '',
            'google_client_secret' => '',
            'logo_image'           => null,
            'hero_slider_enabled'  => true,
        ];

        if (Storage::disk('public')->exists($settingsPath)) {
            $siteSettings = array_merge($siteSettings, json_decode(Storage::disk('public')->get($settingsPath), true) ?? []);
        }

        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                // Only expose the fields the frontend actually needs —
                // never serialize the full Eloquent model to avoid accidentally
                // leaking future sensitive columns.
                'user' => $user ? [
                    'id'                => $user->id,
                    'name'              => $user->name,
                    'email'             => $user->email,
                    'username'          => $user->username,
                    'is_admin'          => (bool) $user->is_admin,
                    'avatar_url'        => $user->avatar_url,
                    'cover_url'         => $user->cover_url,
                    'bio'               => $user->bio,
                    'badge'             => $user->badge,
                    'profile_public'    => (bool) $user->profile_public,
                    'email_verified_at' => $user->email_verified_at,
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
            'isImpersonating' => $request->session()->has('impersonating_admin_id'),
            'siteSettings' => $siteSettings,
            'og' => [
                'title'       => $siteSettings['site_name'] ?? config('app.name', 'Kurogaze'),
                'description' => 'Nonton anime streaming subtitle Indonesia terlengkap dan terupdate setiap hari.',
                'image'       => null,
                'url'         => $request->url(),
                'type'        => 'website',
            ],
            'pendingReports' => ($request->user() && $request->user()->is_admin)
                ? [
                    'count' => Report::where('status', 'pending')->count(),
                    'recent' => Report::with('user')->where('status', 'pending')->latest()->take(5)->get()
                ]
                : ['count' => 0, 'recent' => []],
            'ads' => Storage::disk('public')->exists('ads.json')
                ? json_decode(Storage::disk('public')->get('ads.json'), true)
                : [],
        ];
    }
}
