<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 Not Found - {{ config('app.name') }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'] },
                }
            }
        }
    </script>
    <script>
  // Redirect ke home setelah 3 detik
  setTimeout(() => {
    window.location.href = '/explore';
  }, 3000);
</script>
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; transition: background-color 0.3s ease; }
        .bg-gradient-mesh {
            background-image: 
                radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
                radial-gradient(at 100% 0%, rgba(236, 72, 153, 0.1) 0px, transparent 50%);
        }
        .dark .bg-gradient-mesh {
            background-image: 
                radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
                radial-gradient(at 100% 0%, rgba(236, 72, 153, 0.15) 0px, transparent 50%);
        }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4 md:p-6 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white bg-gradient-mesh overflow-x-hidden transition-colors duration-300">
    @php
        $settingsPath = storage_path('app/public/settings.json');
        $errorImage = null;
        $siteName = config('app.name', 'Hestia');
        $footerCopyright = null;
        
        if (file_exists($settingsPath)) {
            $settings = json_decode(file_get_contents($settingsPath), true);
            $errorImage = $settings['error_404_image'] ?? null;
            $siteName = $settings['site_name'] ?? $siteName;
            $footerCopyright = $settings['footer_copyright'] ?? null;
        }

        if (!$footerCopyright) {
            $footerCopyright = "© " . date('Y') . " " . $siteName . ". All Rights Reserved.";
        }
    @endphp

    <div class="max-w-xl w-full text-center space-y-6 md:space-y-8 relative z-10">
        <!-- Background Glow -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-500/10 dark:bg-blue-600/10 blur-[80px] md:blur-[120px] -z-10 rounded-full"></div>

        @if($errorImage)
            <div class="flex justify-center mb-2 px-6">
                <img src="{{ $errorImage }}" alt="404" class="max-w-full md:max-w-[320px] h-auto rounded-3xl shadow-2xl shadow-blue-500/20 dark:shadow-blue-500/10 border border-slate-200 dark:border-white/10 transition-all duration-500 hover:scale-105 active:scale-95">
            </div>
        @else
            <!-- Error Code fallback if no image -->
            <h1 class="text-[80px] md:text-[140px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 dark:opacity-30">
                404
            </h1>
        @endif
        
        <!-- Content Card -->
        <div class="relative px-4">
            <div class="space-y-3 md:space-y-4">
                <h2 class="text-3xl md:text-5xl font-extrabold tracking-tight">
                    Gomen Ne! <span class="inline-block animate-bounce">😿</span>
                </h2>
                <p class="text-slate-500 dark:text-slate-400 text-base md:text-lg font-medium max-w-sm mx-auto leading-relaxed">
                    Halaman yang kamu cari sudah pindah ke isekai atau memang belum dibuat.
                </p>
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mt-8 md:mt-10">
                <a href="/" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    Beranda
                </a>
                <button onclick="history.back()" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold text-sm transition-all active:scale-95 border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                    Kembali
                </button>
            </div>
        </div>

        <!-- Footer Info -->
        <p class="pt-8 md:pt-12 text-xs md:text-sm font-bold text-slate-400 dark:text-slate-600 tracking-widest uppercase">
            {{ $footerCopyright }}
        </p>
    </div>

    <script>
        // Deteksi tema dari HTML class atau LocalStorage
        function syncTheme() {
            const isDark = document.documentElement.classList.contains('dark') || 
                           localStorage.getItem('theme') === 'dark' || 
                           (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
            
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
        
        syncTheme();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') syncTheme();
            });
        });
        observer.observe(document.documentElement, { attributes: true });
    </script>
</body>
</html>
