<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    private $settingsPath = 'settings.json';

    public function index()
    {
        $settings = $this->getSettings();
        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings
        ]);
    }

    public function update(Request $request)
    {
        // Reserved slugs that cannot be used as the anime URL prefix
        $reservedSlugs = ['admin', 'api', 'profile', 'settings', 'dashboard', 'up',
                          'login', 'register', 'logout', 'password', 'email', 'u',
                          'explore', 'movies', 'leaderboard', 'character', 'library',
                          'episode', 'comments', 'storage'];

        $request->validate([
            'site_name'          => 'required|string|max:255',
            'site_tagline'       => 'nullable|string|max:255',
            'site_slug'          => [
                'required', 'string', 'max:50', 'alpha_dash',
                \Illuminate\Validation\Rule::notIn($reservedSlugs),
            ],
            'favicon'            => 'nullable|file|mimes:png,jpg,jpeg,ico,svg|max:5120',
            'logo_icon'          => 'nullable|string|max:50',
            'logo_image'         => 'nullable|file|mimes:png,jpg,jpeg,webp,svg|max:5120',
            'delete_logo_image'  => 'nullable|boolean',
            'logo_color'         => 'nullable|string|max:20',
            'footer_description' => 'nullable|string|max:500',
            'footer_copyright'   => 'nullable|string|max:255',
            'footer_credit'      => 'nullable|string|max:255',
            'nav_links'          => 'nullable|string',
            'legal_links'        => 'nullable|string',
            'social_facebook'      => 'nullable|url|max:255',
            'social_twitter'      => 'nullable|url|max:255',
            'social_instagram'    => 'nullable|url|max:255',
            'show_visitor_stats'  => 'nullable|boolean',
            'discord_enabled'       => 'nullable|boolean',
            'discord_url'           => 'nullable|url|max:255',
            'discord_title'         => 'nullable|string|max:100',
            'discord_description'   => 'nullable|string|max:300',
            'google_login_enabled'  => 'nullable|boolean',
            'google_client_id'      => 'nullable|string|max:255',
            'google_client_secret'  => 'nullable|string|max:255',
            'hero_slider_enabled'   => 'nullable|boolean',
            'error_404_image'       => 'nullable|file|mimes:png,jpg,jpeg,webp,svg|max:5120',
            'footer_image'          => 'nullable|file|mimes:png,jpg,jpeg,webp,svg|max:5120',
            'delete_favicon'        => 'nullable|boolean',
            'delete_error_404_image' => 'nullable|boolean',
            'delete_footer_image'   => 'nullable|boolean',
            'komiku_url'            => 'nullable|url|max:255',
            'kanna_api_url'         => 'nullable|url|max:255',
            'novel_source_domain'   => 'nullable|url|max:255',
            'novel_api_url'         => 'nullable|url|max:255',
            'novel_cover_hotlink'   => 'nullable|boolean',
            'novel_chapter_mode'    => 'nullable|string|in:live_api,import_db',
        ]);

        $settings = $this->getSettings();
        $settings['site_name']          = $request->site_name;
        $settings['site_tagline']       = $request->site_tagline       ?? 'Streaming Anime';
        $settings['site_slug']          = $request->site_slug;
        $settings['logo_icon']          = $request->logo_icon          ?? 'cat';
        $settings['logo_color']         = $request->logo_color         ?? '#ef4444';
        $settings['footer_description'] = $request->footer_description ?? '';
        $settings['footer_copyright']   = $request->footer_copyright   ?? '';
        $settings['footer_credit']      = $request->footer_credit      ?? '';
        $settings['nav_links']          = json_decode($request->nav_links,   true) ?? $this->defaultNavLinks();
        $settings['legal_links']        = json_decode($request->legal_links, true) ?? $this->defaultLegalLinks();
        $settings['social_facebook']     = $request->social_facebook    ?? '';
        $settings['social_twitter']      = $request->social_twitter     ?? '';
        $settings['social_instagram']    = $request->social_instagram   ?? '';
        $settings['show_visitor_stats']  = $request->boolean('show_visitor_stats');
        $settings['discord_enabled']      = $request->boolean('discord_enabled');
        $settings['discord_url']          = $request->discord_url          ?? '';
        $settings['discord_title']        = $request->discord_title        ?? '';
        $settings['discord_description']  = $request->discord_description  ?? '';
        $settings['google_login_enabled']   = $request->boolean('google_login_enabled');
        $settings['google_client_id']       = $request->google_client_id       ?? '';
        $settings['google_client_secret']   = $request->google_client_secret   ?? '';
        $settings['hero_slider_enabled']    = $request->boolean('hero_slider_enabled');
        $settings['komiku_url']             = $request->komiku_url             ?? 'https://komiku.org';
        $settings['kanna_api_url']          = $request->kanna_api_url          ?? 'https://api.satulagi.my.id';
        $settings['novel_source_domain']    = rtrim($request->novel_source_domain ?: 'https://novel.kiryuuid.net', '/');
        $settings['novel_api_url']          = rtrim($request->novel_api_url ?: ($settings['novel_source_domain'] . '/wp-json/kiryuu/v1'), '/');
        $settings['novel_cover_hotlink']    = $request->boolean('novel_cover_hotlink');
        $settings['novel_chapter_mode']     = in_array($request->novel_chapter_mode, ['live_api', 'import_db'], true) ? $request->novel_chapter_mode : 'live_api';

        if ($request->boolean('delete_favicon')) {
            $settings['favicon'] = null;
        } elseif ($request->hasFile('favicon')) {
            $path = $request->file('favicon')->store('settings', 'public');
            $settings['favicon'] = '/storage/' . $path;
        }

        if ($request->boolean('delete_error_404_image')) {
            $settings['error_404_image'] = null;
        } elseif ($request->hasFile('error_404_image')) {
            $path = $request->file('error_404_image')->store('settings', 'public');
            $settings['error_404_image'] = '/storage/' . $path;
        }

        if ($request->boolean('delete_logo_image')) {
            $settings['logo_image'] = null;
        } elseif ($request->hasFile('logo_image')) {
            $path = $request->file('logo_image')->store('settings', 'public');
            $settings['logo_image'] = '/storage/' . $path;
        }

        if ($request->boolean('delete_footer_image')) {
            $settings['footer_image'] = null;
        } elseif ($request->hasFile('footer_image')) {
            $path = $request->file('footer_image')->store('settings', 'public');
            $settings['footer_image'] = '/storage/' . $path;
        }

        // Ensure storage link exists
        if (!file_exists(public_path('storage'))) {
            try {
                \Illuminate\Support\Facades\Artisan::call('storage:link');
            } catch (\Exception $e) {
                // Silently fail if artisan fails
            }
        }

        Storage::disk('public')->put($this->settingsPath, json_encode($settings, JSON_PRETTY_PRINT));
        
        // Force clear cache so new settings are visible immediately
        try {
            \Illuminate\Support\Facades\Artisan::call('cache:clear');
            \Illuminate\Support\Facades\Artisan::call('view:clear');
            \Illuminate\Support\Facades\Artisan::call('config:cache');
        } catch (\Exception $e) { }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }

    private function getSettings()
    {
        $defaults = [
            'site_name'          => 'NekoNonton',
            'site_slug'          => 'anime',
            'favicon'            => null,
            'error_404_image'    => null,
            'footer_image'       => null,
            'logo_image'         => null,
            'logo_icon'          => 'cat',
            'logo_color'         => '#ef4444',
            'footer_description' => '',
            'footer_copyright'   => '',
            'footer_credit'      => '',
            'nav_links'          => $this->defaultNavLinks(),
            'legal_links'        => $this->defaultLegalLinks(),
            'social_facebook'     => '',
            'social_twitter'      => '',
            'social_instagram'    => '',
            'show_visitor_stats'  => false,
            'discord_enabled'     => false,
            'discord_url'         => '',
            'discord_title'       => 'Join Our Discord',
            'discord_description' => '',
            'google_login_enabled' => false,
            'google_client_id'     => '',
            'google_client_secret' => '',
            'hero_slider_enabled'  => true,
            'komiku_url'           => 'https://komiku.org',
            'kanna_api_url'        => 'https://api.satulagi.my.id',
            'novel_source_domain'  => 'https://novel.kiryuuid.net',
            'novel_api_url'        => 'https://novel.kiryuuid.net/wp-json/kiryuu/v1',
            'novel_cover_hotlink'  => true,
            'novel_chapter_mode'   => 'live_api',
        ];
        if (!Storage::disk('public')->exists($this->settingsPath)) {
            return $defaults;
        }
        return array_merge($defaults, json_decode(Storage::disk('public')->get($this->settingsPath), true) ?? []);
    }

    private function defaultNavLinks(): array
    {
        return [
            ['label' => 'Beranda',       'href' => '/'],
            ['label' => 'Daftar Anime',  'href' => '/explore'],
            ['label' => 'Jadwal Rilis',  'href' => '/schedule'],
            ['label' => 'Request Anime', 'href' => '/request'],
        ];
    }

    private function defaultLegalLinks(): array
    {
        return [
            ['label' => 'Terms of Service', 'href' => '/terms'],
            ['label' => 'Privacy Policy',   'href' => '/privacy'],
            ['label' => 'DMCA',             'href' => '/dmca'],
            ['label' => 'Kontak Kami',      'href' => '/contact'],
        ];
    }
}
