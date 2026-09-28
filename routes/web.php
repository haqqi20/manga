<?php

use App\Http\Controllers\Admin\MangaController;

Route::get('/image-proxy', [MangaController::class , 'proxy'])->middleware(['auth', 'admin'])->name('image.proxy');

use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\PublicMangaController;
use App\Http\Controllers\PublicNovelController;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserSettingsController;
use App\Http\Controllers\AnimeController;
use App\Http\Controllers\EpisodeController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\OtakudesuController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\CharacterController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\SitemapController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


// Manga Routes
Route::get('/manga', [PublicMangaController::class , 'index'])->name('manga.front.index');
Route::get('/manga/{slug}', [PublicMangaController::class , 'show'])->name('manga.show');
Route::get('/manga/{slug}/chapter/{number}', [PublicMangaController::class , 'read'])->name('manga.read');
Route::post('/manga/{slug}/bookmark', [PublicMangaController::class , 'toggleBookmark'])->name('manga.bookmark')->middleware('auth');
Route::post('/manga/{slug}/rate', [PublicMangaController::class , 'rate'])->name('manga.rate')->middleware('auth');


$siteSlug = 'anime';
if (file_exists(storage_path('app/public/settings.json'))) {
    $j = json_decode(file_get_contents(storage_path('app/public/settings.json')), true);
    if (!empty($j['site_slug'])) {
        $siteSlug = $j['site_slug'];
    }
}

Route::get('/', [AnimeController::class , 'index'])->name('home');

// Google OAuth
Route::get('/auth/google', [SocialAuthController::class , 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [SocialAuthController::class , 'handleGoogleCallback'])->name('auth.google.callback');
Route::get('/api/search', [AnimeController::class , 'searchSuggestions'])->middleware('throttle:30,1')->name('search.suggestions');
Route::post('/api/stats/track', [StatsController::class , 'track'])->middleware('throttle:60,1')->name('stats.track');
Route::get('/api/stats', [StatsController::class , 'stats'])->middleware('throttle:60,1')->name('stats.index');
Route::get('/explore', [AnimeController::class , 'explore'])->name('explore');
Route::get('/movies', [AnimeController::class , 'movies'])->name('movies');
Route::get('/leaderboard', [LeaderboardController::class , 'index'])->name('leaderboard');
Route::get('/character/{id}/{slug?}', [CharacterController::class , 'show'])->middleware('throttle:60,1')->name('character.show');
Route::post('/character/{id}/favorite', [CharacterController::class , 'toggleFavorite'])->middleware(['auth', 'throttle:30,1'])->name('character.favorite');
Route::get('/library', [AnimeController::class , 'library'])->name('library')->middleware(['auth', 'verified']);

// --- User Profiles ---
Route::get('/u/{username}', [UserProfileController::class , 'show'])->name('user.profile');
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile/edit', [UserProfileController::class , 'edit'])->name('profile.user.edit');
    Route::post('/profile/update', [UserProfileController::class , 'updateProfile'])->name('profile.user.update');
    Route::post('/profile/avatar', [UserProfileController::class , 'updateAvatar'])->name('profile.user.avatar');
    Route::post('/profile/cover', [UserProfileController::class , 'updateCover'])->name('profile.user.cover');
    Route::get('/settings', [UserSettingsController::class , 'index'])->name('settings');
    Route::post('/settings/email', [UserSettingsController::class , 'updateEmail'])->name('settings.email');
    Route::post('/settings/password', [UserSettingsController::class , 'updatePassword'])->name('settings.password');
    Route::post('/u/{username}/follow', [FollowController::class , 'toggle'])->name('user.follow');
});
Route::post("/{$siteSlug}/{anime}/bookmark", [AnimeController::class , 'toggleBookmark'])->name('anime.bookmark')->middleware('auth');
Route::post("/{$siteSlug}/{anime}/comment", [\App\Http\Controllers\CommentController::class , 'store'])->name('anime.comment.store')->middleware('auth');
Route::post('/episode/{episode}/comment', [\App\Http\Controllers\CommentController::class , 'storeEpisode'])->name('episode.comment.store')->middleware('auth');
Route::post('/manga/{manga}/comment', [\App\Http\Controllers\CommentController::class , 'storeManga'])->name('manga.comment.store')->middleware('auth');
Route::post('/chapter/{chapter}/comment', [\App\Http\Controllers\CommentController::class , 'storeChapter'])->name('chapter.comment.store')->middleware('auth');
Route::delete('/comments/{comment}', [\App\Http\Controllers\CommentController::class , 'destroy'])->name('anime.comment.destroy')->middleware('auth');
Route::post('/episode/{episode}/report', [\App\Http\Controllers\ReportController::class , 'store'])->name('episode.report.store')->middleware('auth');
Route::post('/manga/{manga:slug}/report', [\App\Http\Controllers\ReportController::class , 'manga'])->name('manga.report.store')->middleware('auth');
Route::post('/chapter/{chapter}/report', [\App\Http\Controllers\ReportController::class , 'chapter'])->name('chapter.report.store')->middleware('auth');


Route::get("/{$siteSlug}/{slug}", [AnimeController::class , 'show'])->name('anime.show');
Route::get("/{$siteSlug}/{slug}/episode/{number}", [EpisodeController::class , 'show'])->name('episode.show');

// Unified Series Route (Alias/Fallback)
Route::get('/series/{slug}', function ($slug) {
    // Check if it's a manga
    $manga = \App\Models\Manga::where('slug', $slug)->first();
    if ($manga) {
        return app(PublicMangaController::class)->show($slug);
    }

    // Check if it's an anime
    $anime = \App\Models\Anime::where('slug', $slug)->first();
    if ($anime) {
        return app(AnimeController::class)->show(request(), $slug);
    }

    abort(404);
})->name('series.show');

Route::get('/dashboard', function () {
    if (auth()->user()->is_admin) {
        return redirect()->route('admin.dashboard');
    }
    return app(App\Http\Controllers\UserSettingsController::class)->dashboard(request());
})->middleware(['auth', 'verified'])->name('dashboard');

// â”€â”€â”€ Admin React Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/', [AdminController::class , 'dashboard'])->name('dashboard');

    // Anime CRUD
    Route::get('/anime', [AdminController::class , 'animeIndex'])->name('anime.index');
    Route::get('/anime/create', [AdminController::class , 'animeCreate'])->name('anime.create');
    Route::post('/anime', [AdminController::class , 'animeStore'])->name('anime.store');
    Route::get('/anime/{anime}/edit', [AdminController::class , 'animeEdit'])->name('anime.edit');
    Route::put('/anime/{anime}', [AdminController::class , 'animeUpdate'])->name('anime.update');
    Route::delete('/anime/{anime}', [AdminController::class , 'animeDestroy'])->name('anime.destroy');

    // Episode CRUD
    Route::get('/episodes', [AdminController::class , 'episodeIndex'])->name('episode.index');
    Route::get('/episodes/create', [AdminController::class , 'episodeCreate'])->name('episode.create');
    Route::post('/episodes', [AdminController::class , 'episodeStore'])->name('episode.store');
    Route::get('/episodes/{episode}/edit', [AdminController::class , 'episodeEdit'])->name('episode.edit');
    Route::put('/episodes/{episode}', [AdminController::class , 'episodeUpdate'])->name('episode.update');
    Route::delete('/episodes/{episode}', [AdminController::class , 'episodeDestroy'])->name('episode.destroy');

    // Genre CRUD
    Route::get('/genres', [AdminController::class , 'genreIndex'])->name('genre.index');
    Route::post('/genres', [AdminController::class , 'genreStore'])->name('genre.store');
    Route::put('/genres/{genre}', [AdminController::class , 'genreUpdate'])->name('genre.update');
    Route::delete('/genres/{genre}', [AdminController::class , 'genreDestroy'])->name('genre.destroy');

    // Characters
    Route::get('/characters', [AdminController::class , 'characterIndex'])->name('character.index');

    // Users
    Route::get('/users', [AdminController::class , 'userIndex'])->name('user.index');
    Route::patch('/users/{user}/toggle-admin', [AdminController::class , 'userToggleAdmin'])->name('user.toggle-admin');
    Route::patch('/users/{user}/badge', [AdminController::class , 'userUpdateBadge'])->name('user.update-badge');
    Route::delete('/users/{user}', [AdminController::class , 'userDestroy'])->name('user.destroy');
    Route::post('/users/{user}/impersonate', [AdminController::class , 'userImpersonate'])->name('user.impersonate');

    // Pages
    Route::get('/pages', [AdminController::class , 'pageIndex'])->name('page.index');
    Route::get('/pages/create', [AdminController::class , 'pageCreate'])->name('page.create');
    Route::post('/pages', [AdminController::class , 'pageStore'])->name('page.store');
    Route::get('/pages/{page}/edit', [AdminController::class , 'pageEdit'])->name('page.edit');
    Route::put('/pages/{page}', [AdminController::class , 'pageUpdate'])->name('page.update');
    Route::delete('/pages/{page}', [AdminController::class , 'pageDestroy'])->name('page.destroy');

    // Reports
    Route::get('/reports', [AdminController::class , 'reportIndex'])->name('report.index');
    Route::patch('/reports/{report}/status', [AdminController::class , 'reportUpdateStatus'])->name('report.update-status');
    Route::delete('/reports/{report}', [AdminController::class , 'reportDestroy'])->name('report.destroy');

    // Settings
    Route::get('/settings', [SettingController::class , 'index'])->name('settings.index');
    Route::post('/profile', [AdminController::class , 'updateProfile'])->name('profile.update');
    Route::post('/settings', [SettingController::class , 'update'])->name('settings.update');

    // Ads
    Route::get('/ads', [\App\Http\Controllers\Admin\AdController::class , 'index'])->name('ads.index');
    Route::post('/ads', [\App\Http\Controllers\Admin\AdController::class , 'update'])->name('ads.update');

    // â”€â”€ Inline Episode Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    Route::post('/anime/{anime}/episodes', [AdminController::class , 'animeEpisodeStore'])->name('admin.anime.episode.store');
    Route::put('/anime/{anime}/episodes/{episode}', [AdminController::class , 'animeEpisodeUpdate'])->name('admin.anime.episode.update');
    Route::delete('/anime/{anime}/episodes/{episode}', [AdminController::class , 'animeEpisodeDestroy'])->name('admin.anime.episode.destroy');

    // â”€â”€ Characters & Staff â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    Route::post('/anime/{anime}/toggle-featured', [AdminController::class , 'toggleFeatured'])->name('admin.anime.featured.toggle');
    Route::post('/anime/{anime}/characters', [AdminController::class , 'characterStore'])->name('admin.character.store');
    Route::put('/anime/{anime}/characters/{character}', [AdminController::class , 'characterUpdate'])->name('admin.character.update');
    Route::delete('/anime/{anime}/characters/{character}', [AdminController::class , 'characterDestroy'])->name('admin.character.destroy');
    Route::post('/anime/{anime}/staff', [AdminController::class , 'staffStore'])->name('admin.staff.store');
    Route::delete('/anime/{anime}/staff/{staff}', [AdminController::class , 'staffDestroy'])->name('admin.staff.destroy');
    Route::post('/anime/{anime}/sync-cast', [AdminController::class , 'syncCast'])->name('admin.cast.sync');


    // Manga CRUD
    Route::post('/manga/{manga}/toggle-featured', [\App\Http\Controllers\Admin\MangaController::class , 'toggleFeatured'])->name('manga.featured.toggle');
    Route::get('/manga', [\App\Http\Controllers\Admin\MangaController::class , 'index'])->name('manga.index');
    Route::get('/manga/create', [\App\Http\Controllers\Admin\MangaController::class , 'create'])->name('manga.create');
    Route::post('/manga', [\App\Http\Controllers\Admin\MangaController::class , 'store'])->name('manga.store');
    Route::get('/manga/{manga}/edit', [\App\Http\Controllers\Admin\MangaController::class , 'edit'])->name('manga.edit');
    Route::put('/manga/{manga}', [\App\Http\Controllers\Admin\MangaController::class , 'update'])->name('manga.update');
    Route::delete('/manga/{manga}', [\App\Http\Controllers\Admin\MangaController::class , 'destroy'])->name('manga.destroy');

    // Manga Mass Chapter Checker
    Route::get('/manga-mass-check', [\App\Http\Controllers\Admin\MangaController::class , 'massCheckPage'])->name('manga.mass-check');
    Route::post('/manga-mass-check/run', [\App\Http\Controllers\Admin\MangaController::class , 'massCheckRun'])->name('manga.mass-check.run');
    Route::get('/manga-mass-check/logs', [\App\Http\Controllers\Admin\MangaController::class , 'massCheckLogs'])->name('manga.mass-check.logs');
    Route::get('/manga-mass-check/download', [\App\Http\Controllers\Admin\MangaController::class , 'massCheckDownloadLog'])->name('manga.mass-check.download');
    Route::post('/manga-mass-check/clear-log', [\App\Http\Controllers\Admin\MangaController::class , 'massCheckClearLog'])->name('manga.mass-check.clear');

    // Manga Importer
    Route::get('/manga-importer', [\App\Http\Controllers\Admin\MangaImporterController::class , 'index'])->name('manga.importer');
    Route::post('/manga-importer/fetch', [\App\Http\Controllers\Admin\MangaImporterController::class , 'fetch'])->name('manga.importer.fetch');
    Route::post('/manga-importer/store', [\App\Http\Controllers\Admin\MangaImporterController::class , 'store'])->name('manga.importer.store');
    Route::post('/manga-importer/import-chapter/{manga}', [\App\Http\Controllers\Admin\MangaImporterController::class , 'importChapter'])->name('manga.importer.chapter');

    // Chapter Management
    Route::get('/manga/{manga}/chapters', [\App\Http\Controllers\Admin\MangaController::class , 'chapters'])->name('manga.chapters.index');
    Route::post('/manga/{manga}/chapters', [\App\Http\Controllers\Admin\MangaController::class , 'storeChapter'])->name('manga.chapters.store');
    Route::get('/chapters/{chapter}/edit', [\App\Http\Controllers\Admin\MangaController::class , 'editChapter'])->name('manga.chapters.edit');
    Route::put('/chapters/{chapter}', [\App\Http\Controllers\Admin\MangaController::class , 'updateChapter'])->name('manga.chapters.update');
    Route::delete('/chapters/{chapter}', [\App\Http\Controllers\Admin\MangaController::class , 'destroyChapter'])->name('manga.chapters.destroy');
    Route::get('/manga/{manga}/check-updates', [\App\Http\Controllers\Admin\MangaController::class , 'checkUpdates'])->name('manga.chapters.check-updates');
    Route::post('/manga/{manga}/bulk-import', [\App\Http\Controllers\Admin\MangaController::class , 'bulkImportMissing'])->name('manga.chapters.bulk-import');

    // Chapter Images Gallery API
    Route::get('/chapters/{chapter}/images', [\App\Http\Controllers\Admin\MangaController::class , 'getChapterImages'])->name('admin.chapters.images');
    Route::post('/chapters/{chapter}/images', [\App\Http\Controllers\Admin\MangaController::class , 'addImage'])->name('admin.chapters.images.store');
    Route::delete('/chapter-images/{image}', [\App\Http\Controllers\Admin\MangaController::class , 'deleteImage'])->name('admin.chapters.images.delete');
    Route::put('/chapters/{chapter}/reorder', [\App\Http\Controllers\Admin\MangaController::class , 'reorderImages'])->name('admin.chapters.reorder');

    // Otakudesu API Proxy & Episode Scraper
    Route::get('/anime-mass-update', [OtakudesuController::class , 'massUpdatePage'])->name('anime.mass-update');
    Route::get('/otakudesu/ongoing-titles', [OtakudesuController::class , 'ongoingTitles'])->name('otakudesu.ongoing-titles');
    Route::post('/otakudesu/mass-update-latest', [OtakudesuController::class , 'massUpdateLatest'])->name('otakudesu.mass-update-latest');
    Route::get('/otakudesu/search', [OtakudesuController::class , 'search'])->name('otakudesu.search');
    Route::get('/otakudesu/anime/{slug}', [OtakudesuController::class , 'animeDetail'])->name('otakudesu.anime');
    Route::get('/otakudesu/episode/{eps}', [OtakudesuController::class , 'episodeDetail'])->name('otakudesu.episode');
    Route::post('/anime/{anime}/scrape-episodes', [OtakudesuController::class , 'bulkScrape'])->name('anime.scrape-episodes');
    // License Management
    Route::get('/license-manager', [AdminController::class , 'licenseIndex'])->name('license.index');
    Route::post('/license/activate', [AdminController::class , 'licenseActivate'])->name('license.activate');
    Route::post('/license/deactivate', [AdminController::class , 'licenseDeactivate'])->name('license.deactivate');
    Route::post('/license/reverify', [AdminController::class , 'licenseReverify'])->name('license.reverify');

    // Script Updater
    Route::get('/updater', [\App\Http\Controllers\Admin\UpdateController::class , 'index'])->name('updater.index');
    Route::post('/updater/upload', [\App\Http\Controllers\Admin\UpdateController::class , 'upload'])->name('updater.upload');

});

use App\Http\Controllers\AnilistController;

// Impersonate stop — accessible while logged in as the impersonated user
Route::post('/impersonate/stop', [AdminController::class , 'stopImpersonate'])
    ->middleware('auth')
    ->name('impersonate.stop');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class , 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class , 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class , 'destroy'])->name('profile.destroy');

    // AniList API proxy
    Route::get('/api/anilist/search', [AnilistController::class , 'search'])->name('anilist.search');
    Route::get('/api/anilist/fetch', [AnilistController::class , 'fetch'])->name('anilist.fetch');
});

require __DIR__ . '/auth.php';

// --- Google Site Verification ────────────────────────────────────────────────
Route::get('/google6bbe6d02f69ad6c1.html', function () {
    return 'google-site-verification: google6bbe6d02f69ad6c1.html';
});

// --- Storage Fallback & Link Helper ---
Route::get('/storage/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);
    if (!file_exists($fullPath)) {
        abort(404);
    }
    return response()->file($fullPath);
})->where('path', '.*');

Route::get('/system/storage-link', function () {
    if (!auth()->check() || !auth()->user()->is_admin) {
        return "Unauthorized.";
    }
    $output = "";
    try {
        // Fix Storage Link
        \Illuminate\Support\Facades\Artisan::call('storage:link');
        $output .= "Storage link: " . \Illuminate\Support\Facades\Artisan::output() . "<br>";

        // Fix Build Link (for nested public folders)
        $publicPath = public_path();
        $buildPath = $publicPath . '/build';
        $realBuildPath = base_path('build');

        if (!file_exists($buildPath) && file_exists($realBuildPath)) {
            if (symlink($realBuildPath, $buildPath)) {
                $output .= "Build link created successfully.<br>";
            }
            else {
                $output .= "Failed to create Build link via PHP symlink().<br>";
                // Try shell
                if (function_exists('exec')) {
                    exec("ln -s " . escapeshellarg($realBuildPath) . " " . escapeshellarg($buildPath), $out, $ret);
                    $output .= "Build link via shell: " . ($ret === 0 ? "SUCCESS" : "FAILED") . "<br>";
                }
            }
        }
        elseif (file_exists($buildPath)) {
            $output .= "Build directory/link already exists in public.<br>";
        }

        return $output;
    }
    catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
})->middleware(['auth']);

Route::get('/system/migrate', function () {
    if (!auth()->check() || !auth()->user()->is_admin) {
        return "Unauthorized.";
    }
    try {
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        return "Migration Success: <br><pre>" . \Illuminate\Support\Facades\Artisan::output() . "</pre>";
    }
    catch (\Exception $e) {
        return "Migration Error: " . $e->getMessage();
    }
})->middleware(['auth']);

// Sitemap
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/sitemap/static.xml', [SitemapController::class, 'static'])->name('sitemap.static');
Route::get('/sitemap/{type}/{page}.xml', [SitemapController::class, 'map'])
    ->where(['type' => 'anime|episode|manga|chapter', 'page' => '[0-9]+'])
    ->name('sitemap.map');

// Halaman statis dari Admin → Pages (/terms, /privacy, /dmca, /contact, ...).
// Fallback: hanya dipakai jika tidak ada route lain yang cocok.
Route::fallback([\App\Http\Controllers\PageController::class, 'show']);
