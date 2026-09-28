<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php
            $settingsPath = 'settings.json';
            $siteName = config('app.name', 'Kurogaze');
            $favicon = null;
            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($settingsPath)) {
                $settings = json_decode(\Illuminate\Support\Facades\Storage::disk('public')->get($settingsPath), true);
                if (!empty($settings['site_name'])) $siteName = $settings['site_name'];
                if (!empty($settings['favicon'])) $favicon = $settings['favicon'];
            }

            // Fallback for non-Inertia requests (like license error page)
            $pageData = $page ?? ['props' => [], 'component' => ''];
            $og    = $pageData['props']['og'] ?? [];
            $ogTitle = $og['title']       ?? $siteName;
            $ogDesc  = $og['description'] ?? 'Mangaku tempat baca komik, manga, manhwa, manhua, novel, dan anime subtitle Indonesia dengan update tercepat setiap hari. Jelajahi berbagai genre populer melalui tampilan yang responsif dan mudah digunakan.';
            $ogImage = $og['image']       ?? null;
            $ogUrl   = $og['url']         ?? request()->url();
            $ogType  = $og['type']        ?? 'website';
        @endphp

        <title inertia>{{ $ogTitle }} - Baca Manga, Novel & Nonton Anime Sub Indo</title>


<meta name="description" content="{{ $ogDesc }}">
<meta name="keywords" content="mangaku, baca manga indo, manga indonesia, manhwa indo, manhua indo, komik online gratis, manga terbaru, manga lengkap, manhwa terbaru, komik sub indo, webtoon indonesia">
@php
    $noIndexPages = [
        'Manga/Show',
        'Manga/Read',
        'Novel/Show',
        'Novel/Read',
        'Anime/Show',
        'Anime/Player',
    ];
@endphp
@if(in_array($pageData['component'] ?? '', $noIndexPages))
<meta name="robots" content="noindex, nofollow">
@else
<meta name="robots" content="index, follow">
@endif
<link rel="canonical" href="{{ $ogUrl }}">

        <!-- Open Graph / WhatsApp / Facebook -->
        <meta property="og:type" content="{{ $ogType }}">
        <meta property="og:url" content="{{ $ogUrl }}">
        <meta property="og:title" content="{{ $ogTitle }} - Baca Manga, Novel & Nonton Anime Sub Indo">
        <meta property="og:description" content="{{ $ogDesc }}">
        <meta property="og:site_name" content="{{ $siteName }}">
        @if($ogImage)
        <meta property="og:image" content="{{ $ogImage }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        @endif

        <!-- Twitter Card -->
        <meta name="twitter:card" content="{{ $ogImage ? 'summary_large_image' : 'summary' }}">
        <meta name="twitter:title" content="{{ $ogTitle }}">
        <meta name="twitter:description" content="{{ $ogDesc }}">
        @if($ogImage)
        <meta name="twitter:image" content="{{ $ogImage }}">
        @endif

        @if($favicon)
            <link rel="icon" href="{{ $favicon }}">
        @endif

        <!-- Theme Script -->
        <script>
            if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        </script>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

        <!-- Scripts -->
        <script>window.__siteName = @json($siteName);</script>
        @routes
        @viteReactRefresh
        @php
            $viteFiles = ['resources/js/app.jsx'];
            if (!empty($pageData['component'])) {
                $viteFiles[] = "resources/js/Pages/{$pageData['component']}.jsx";
            }
        @endphp
        @vite($viteFiles)
        @if(isset($page))
            @inertiaHead
        @endif
</head>
    <body class="font-sans antialiased bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 selection:bg-primary selection:text-white">
        @if(isset($page))
            @inertia
        @else
            @yield('content')
        @endif
    </body>
</html>
