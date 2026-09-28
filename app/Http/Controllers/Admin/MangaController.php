<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Manga;
use App\Models\Chapter;
use App\Models\ChapterImage;
use App\Models\Genre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MangaController extends Controller
{
public function index(Request $request)
{
    $query = Manga::withCount('chapters');

    // ✅ FILTER SEARCH
    if ($request->search) {
        $query->where('title', 'like', '%' . $request->search . '%');
    }

    $mangas = $query->latest()->paginate(10)->withQueryString();

    return Inertia::render('Admin/Manga/Index', [
        'mangas' => $mangas,
        'filters' => [
            'search' => $request->search
        ]
    ]);
}

    public function create()
    {
        $genres = Genre::all();
        return Inertia::render('Admin/Manga/Create', [
            'genres' => $genres
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:mangas,slug',
            'synopsis' => 'nullable|string',
            'status' => 'required|string',
            'type' => 'required|string',
            'author' => 'nullable|string',
            'artist' => 'nullable|string',
            'poster' => 'nullable|image|max:2048',
            'is_featured' => 'boolean',
            'rating' => 'nullable|numeric|min:0|max:10',
            'release_year' => 'nullable|integer',
            'genres' => 'array',
        ]);

        if ($request->hasFile('poster')) {
            $path = $request->file('poster')->store('posters/manga', 'public');
            $validated['poster'] = '/storage/' . $path;
        }

        $manga = Manga::create($validated);

        if ($request->has('genres')) {
            $manga->genres()->sync($request->genres);
        }

        \Illuminate\Support\Facades\Cache::forget('home_trending_manga_v1');

        return redirect()->route('admin.manga.index')->with('success', 'Manga created successfully.');
    }

    public function edit(Manga $manga)
    {
        $manga->load(['genres', 'chapters' => function($query) {
            $query->withCount('images')->orderBy('chapter_number', 'desc');
        }]);
        $genres = Genre::all();
        return Inertia::render('Admin/Manga/Edit', [
            'manga' => $manga,
            'genres' => $genres
        ]);
    }

    public function update(Request $request, Manga $manga)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:mangas,slug,' . $manga->id,
            'synopsis' => 'nullable|string',
            'status' => 'required|string',
            'source_url' => 'nullable|url',
            'type' => 'required|string',
            'author' => 'nullable|string',
            'artist' => 'nullable|string',
            'poster' => 'nullable', 
            'is_featured' => 'boolean',
            'rating' => 'nullable|numeric|min:0|max:10',
            'release_year' => 'nullable|integer',
            'genres' => 'array',
        ]);

        if ($request->hasFile('poster')) {
            // Delete old poster if exists
            if ($manga->poster && !str_starts_with($manga->poster, 'http')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $manga->poster));
            }
            $path = $request->file('poster')->store('posters/manga', 'public');
            $validated['poster'] = '/storage/' . $path;
        } else {
            // Do not overwrite existing poster with null if no new file is uploaded
            unset($validated['poster']);
        }

        $manga->update($validated);

        if ($request->has('genres')) {
            $manga->genres()->sync($request->genres);
        }

        \Illuminate\Support\Facades\Cache::forget('home_trending_manga_v1');
        \Illuminate\Support\Facades\Cache::forget('home_popular_manga_v2');

        return redirect()->route('admin.manga.index')->with('success', 'Manga updated successfully.');
    }

    public function destroy(Manga $manga)
    {
        if ($manga->poster && !str_starts_with($manga->poster, 'http')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $manga->poster));
        }

        // Cascade delete chapters images
        foreach ($manga->chapters as $chapter) {
            foreach ($chapter->images as $image) {
                Storage::disk('public')->delete($image->image_path);
            }
        }

        $manga->delete();
        \Illuminate\Support\Facades\Cache::forget('home_trending_manga_v1');
        return redirect()->route('admin.manga.index')->with('success', 'Manga deleted successfully.');
    }

    public function toggleFeatured(Manga $manga)
    {
        $manga->update(['is_featured' => !$manga->is_featured]);
        \Illuminate\Support\Facades\Cache::forget('home_trending_manga_v1');
        return redirect()->back()->with('success', 'Manga Slider Hero updated successfully.');
    }

    public function checkUpdates(Manga $manga)
    {
        if (!$manga->source_url) {
            return response()->json(['error' => 'Source URL tidak ditemukan.'], 422);
        }

        try {
            $settings = [];
            if (Storage::disk('public')->exists('settings.json')) {
                $settings = json_decode(Storage::disk('public')->get('settings.json'), true) ?? [];
            }
            $apiBaseUrl = rtrim($settings['kanna_api_url'] ?? 'https://api.satulagi.my.id', '/');

            // Extract slug from Komiku URL
            $urlPath = parse_url($manga->source_url, PHP_URL_PATH);
            $segments = array_filter(explode('/', $urlPath));
            $slug = end($segments);

            if (!$slug) {
                return response()->json(['error' => 'Slug tidak valid dari Source URL.'], 422);
            }

            $apiUrl = "{$apiBaseUrl}/api/manga/detail-komik/{$slug}";
            $response = \Illuminate\Support\Facades\Http::withoutVerifying()->timeout(30)->get($apiUrl);

            if ($response->failed()) {
                return response()->json(['error' => 'Gagal mengambil data dari API.'], 422);
            }

            $data = $response->json();
            $scrapedChapters = $data['chapters'] ?? [];
            $existingNumbers = $manga->chapters()->pluck('chapter_number')->toArray();

            $missingChapters = [];
            foreach ($scrapedChapters as $ch) {
                $rawNum = (string)($ch['chapterNumber'] ?? 0);
                $num = (float) str_replace(['-', ','], '.', $rawNum);
                
                if (!in_array($num, $existingNumbers)) {
                    $missingChapters[] = [
                        'number' => $num,
                        'title' => $ch['title'] ?? ('Chapter ' . $num),
                        'url' => $ch['originalLink'] ?? ($manga->source_url . 'chapter-' . str_replace('.', '-', $num))
                    ];
                }
            }

            // Return latest chapters first
            usort($missingChapters, fn($a, $b) => $b['number'] <=> $a['number']);

            return response()->json([
                'manga' => $manga,
                'missing_chapters' => $missingChapters
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function bulkImportMissing(Request $request, Manga $manga)
    {
        $validated = $request->validate([
            'chapters' => 'required|array',
            'chapters.*.number' => 'required|numeric',
            'chapters.*.url' => 'required|url',
            'chapters.*.title' => 'nullable|string'
        ]);

        // This could be slow, so we just return the list and let the frontend handle calling the import-chapter endpoint for each
        // Or we can do it here. But for better UX (progress bar), frontend should call importChapter for each.
        return response()->json(['success' => true]);
    }

    // --- Chapter Management ---

    public function chapters(Manga $manga)
    {
        $chapters = $manga->chapters()->withCount('images')->orderBy('chapter_number', 'desc')->paginate(20);
        return Inertia::render('Admin/Manga/Chapters/Index', [
            'manga' => $manga,
            'chapters' => $chapters
        ]);
    }

    public function storeChapter(Request $request, Manga $manga)
    {
        $validated = $request->validate([
            'title' => 'nullable|string',
            'chapter_number' => 'required|numeric',
            'images.*' => 'required|image|max:3072',
        ]);

        $validated['chapter_number'] = (float) $validated['chapter_number'];

        $slug = 'chapter-' . str_replace('.', '-', $validated['chapter_number']);
        
        $chapter = $manga->chapters()->create([
            'title' => $validated['title'],
            'slug' => $slug,
            'chapter_number' => $validated['chapter_number']
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store("manga/{$manga->slug}/{$slug}", 'public');
                $chapter->images()->create([
                    'image_path' => $path,
                    'order' => $index
                ]);
            }
        }

        return redirect()->back()->with('success', 'Chapter added successfully.');
    }

    public function editChapter(Chapter $chapter)
    {
        $chapter->load(['manga', 'images' => function($query) {
            $query->orderBy('order', 'asc');
        }]);
        
        return Inertia::render('Admin/Manga/Chapters/Edit', [
            'chapter' => $chapter,
            'manga' => $chapter->manga
        ]);
    }

    public function updateChapter(Request $request, Chapter $chapter)
    {
        $validated = $request->validate([
            'title' => 'nullable|string',
            'chapter_number' => 'required|numeric',
            'content' => 'nullable|string',
            'source_url' => 'nullable|url',
        ]);

        $validated['chapter_number'] = (float) $validated['chapter_number'];

        $chapter->update([
            'title' => $validated['title'],
            'chapter_number' => $validated['chapter_number'],
            'content' => $validated['content'],
            'source_url' => $validated['source_url'],
            'slug' => 'chapter-' . str_replace('.', '-', $validated['chapter_number'])
        ]);

        return redirect()->back()->with('success', 'Chapter updated successfully.');
    }

    public function destroyChapter(Chapter $chapter)
    {
        foreach ($chapter->images as $image) {
            if (!str_starts_with($image->image_path, 'http')) {
                Storage::disk('public')->delete($image->image_path);
            }
        }
        $chapter->delete();
        return redirect()->back()->with('success', 'Chapter deleted successfully.');
    }

    public function getChapterImages(Chapter $chapter)
    {
        return response()->json($chapter->load('images'));
    }

    public function addImage(Request $request, Chapter $chapter)
    {
        $validated = $request->validate([
            'image_file' => 'nullable|image|max:3072',
            'image_url' => 'nullable|string'
        ]);

        $order = $chapter->images()->max('order') + 1;

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store("manga/{$chapter->manga->slug}/{$chapter->slug}", 'public');
            $chapter->images()->create([
                'image_path' => $path,
                'order' => $order
            ]);
        } elseif ($request->image_url) {
            $chapter->images()->create([
                'image_path' => $request->image_url,
                'order' => $order
            ]);
        }

        return response()->json(['success' => true]);
    }

    public function deleteImage(ChapterImage $image)
    {
        if (!str_starts_with($image->image_path, 'http')) {
            Storage::disk('public')->delete($image->image_path);
        }
        $image->delete();
        return response()->json(['success' => true]);
    }

    public function reorderImages(Request $request, Chapter $chapter)
    {
        $validated = $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|exists:chapter_images,id',
            'orders.*.order' => 'required|integer'
        ]);

        foreach ($validated['orders'] as $item) {
            ChapterImage::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return response()->json(['success' => true]);
    }


    public function massCheckPage()
    {
        return Inertia::render('Admin/Manga/MassCheck', [
            'defaultStartPage' => 1,
            'defaultEndPage' => 15,
            'failedLogs' => $this->readMangaFailedLogs(),
            'logExists' => file_exists(storage_path('logs/manga-update-failed.log')),
        ]);
    }

    public function massCheckRun(Request $request)
    {
        @set_time_limit(0);
        @ini_set('memory_limit', '768M');

        $validated = $request->validate([
            'start_page' => 'nullable|integer|min:1|max:999',
            'end_page' => 'nullable|integer|min:1|max:999',
            'limit' => 'nullable|integer|min:1|max:5000',
            'auto_import_missing' => 'nullable|boolean',
        ]);

        $startPage = (int)($validated['start_page'] ?? 1);
        $endPage = (int)($validated['end_page'] ?? 15);
        if ($endPage < $startPage) {
            [$startPage, $endPage] = [$endPage, $startPage];
        }
        $limit = (int)($validated['limit'] ?? 0);
        $autoImportMissing = (bool)($validated['auto_import_missing'] ?? false);

        $this->clearMangaFailedLog();

        $items = $this->collectKomikuItems($startPage, $endPage);
        if ($limit > 0) {
            $items = array_slice($items, 0, $limit);
        }

        $checked = 0;
        $updated = 0;
        $importedManga = 0;
        $importedChapters = 0;
        $failed = 0;

        foreach ($items as $item) {
            $checked++;
            $title = $item['title'] ?? '';

            try {
                $manga = $this->findLocalMangaByTitle($title);
                if (!$manga) {
                    if (!$autoImportMissing) {
                        throw new \RuntimeException('Manga tidak ditemukan di admin');
                    }

                    $manga = $this->importMissingMangaFromKomiku($item);
                    $importedManga++;
                }

                $missingChapters = $this->getMissingChaptersForManga($manga);
                if (empty($missingChapters)) {
                    continue;
                }

                usort($missingChapters, fn ($a, $b) => $a['number'] <=> $b['number']);

                foreach ($missingChapters as $chapter) {
                    $this->importMissingChapterForManga($manga, $chapter);
                    $importedChapters++;
                }

                $updated++;
            } catch (\Throwable $e) {
                $failed++;
                $this->writeMangaFailedLog($title, $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'checked' => $checked,
            'updated' => $updated,
            'imported_manga' => $importedManga,
            'imported_chapters' => $importedChapters,
            'failed' => $failed,
            'failed_logs' => $this->readMangaFailedLogs(),
        ]);
    }

    public function massCheckLogs()
    {
        return response()->json([
            'logs' => $this->readMangaFailedLogs(),
            'logExists' => file_exists(storage_path('logs/manga-update-failed.log')),
        ]);
    }

    public function massCheckDownloadLog()
    {
        $path = storage_path('logs/manga-update-failed.log');
        if (!file_exists($path)) {
            file_put_contents($path, '');
        }

        return response()->download($path, 'gagal.txt', [
            'Content-Type' => 'text/plain; charset=UTF-8',
        ]);
    }

    public function massCheckClearLog()
    {
        $this->clearMangaFailedLog();

        return response()->json(['success' => true, 'logs' => []]);
    }

    private function collectKomikuItems(int $startPage, int $endPage): array
    {
        $all = [];

        for ($page = $startPage; $page <= $endPage; $page++) {
            try {
                $url = "https://api.komiku.org/manga/page/{$page}/?orderby=modified&tipe&genre&genre2&status";
                $response = Http::withoutVerifying()
                    ->withHeaders([
                        'User-Agent' => 'Mozilla/5.0',
                        'Accept' => 'text/html,application/json,*/*',
                    ])
                    ->timeout(120)
                    ->get($url);

                if ($response->failed()) {
                    throw new \RuntimeException('Gagal ambil page ' . $page . ' | HTTP ' . $response->status());
                }

                $items = $this->extractItemsFromKomikuHtml($response->body());
                $all = array_merge($all, $items);
            } catch (\Throwable $e) {
                $this->writeMangaFailedLog('[PAGE ' . $page . ']', $e->getMessage());
            }
        }

        $unique = [];
        foreach ($all as $item) {
            $title = $this->cleanKomikuTitle($item['title'] ?? '');
            if (!$this->isBadKomikuTitle($title)) {
                $unique[$title] = [
                    'title' => $title,
                    'url' => $item['url'] ?? null,
                ];
            }
        }

        return array_values($unique);
    }

    private function extractItemsFromKomikuHtml(string $html): array
    {
        $items = [];

        preg_match_all('/<div[^>]*class=["\'][^"\']*\bbge\b[^"\']*["\'][^>]*>(.*?)<\/div>\s*<\/div>/is', $html, $blocks);
        $blocks = $blocks[1] ?? [];
        if (empty($blocks)) {
            preg_match_all('/<h[34][^>]*>.*?<\/h[34]>/is', $html, $headingMatches);
            $blocks = $headingMatches[0] ?? [];
        }

        foreach ($blocks as $block) {
            $title = '';
            $url = null;

            if (preg_match('/<h[34][^>]*>(.*?)<\/h[34]>/is', $block, $m)) {
                $title = strip_tags($m[1]);
            }
            if (!$title && preg_match('/<img[^>]+alt=["\']([^"\']+)["\']/i', $block, $m)) {
                $title = $m[1];
            }
            if (preg_match('/<a[^>]+href=["\']([^"\']+)["\']/i', $block, $m)) {
                $url = html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
                if ($url && str_starts_with($url, '/')) {
                    $url = 'https://komiku.org' . $url;
                }
            }

            $title = $this->cleanKomikuTitle(html_entity_decode($title, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
            $title = preg_replace('/\b(Drama|Action|Romance|Fantasy|Comedy|School|Adventure|Magic|Shounen|Seinen|Slice of Life|Horror|Isekai)\b.*$/i', '', $title);
            $title = trim($title);

            if (!$this->isBadKomikuTitle($title)) {
                $items[] = [
                    'title' => $title,
                    'url' => $url,
                ];
            }
        }

        return $items;
    }

    private function cleanKomikuTitle(?string $text): string
    {
        $text = preg_replace('/\s+/u', ' ', (string)$text);
        $text = preg_replace('/^Komik\s+/i', '', $text);
        $text = preg_replace('/^Manga\s+/i', '', $text);
        $text = preg_replace('/^Manhwa\s+/i', '', $text);
        $text = preg_replace('/^Manhua\s+/i', '', $text);
        $text = preg_replace('/\s+Bahasa Indonesia$/i', '', $text);
        $text = preg_replace('/\s+Chapter\s+\d+.*$/i', '', $text);
        $text = preg_replace('/\s+Ch\.\s*\d+.*$/i', '', $text);
        $text = preg_replace('/\s+Up\s+\d+$/i', '', $text);

        return trim($text);
    }

    private function isBadKomikuTitle(?string $title): bool
    {
        $title = trim((string)$title);
        if ($title === '') return true;

        $badExact = ['manga', 'manhwa', 'manhua', 'drama', 'action', 'romance', 'fantasy', 'comedy', 'school', 'adventure', 'magic', 'up'];
        $lower = strtolower($title);

        if (in_array($lower, $badExact, true)) return true;
        if (preg_match('/^(manga|manhwa|manhua)\s+/i', $title)) return true;
        if (preg_match('/\bup\s+\d+$/i', $title)) return true;
        if (preg_match('/^(drama|action|romance|fantasy|comedy|school|adventure|magic)\b/i', $title)) return true;
        if (mb_strlen($title) < 3 || mb_strlen($title) > 120) return true;

        return false;
    }

    private function findLocalMangaByTitle(string $title): ?Manga
    {
        $clean = $this->cleanKomikuTitle($title);

        return Manga::where('title', $clean)->first()
            ?: Manga::where('title', 'like', '%' . addcslashes($clean, '%_') . '%')->first();
    }

    private function importMissingMangaFromKomiku(array $item): Manga
    {
        $title = $this->cleanKomikuTitle($item['title'] ?? '');
        $sourceUrl = $item['url'] ?? null;

        if (!$sourceUrl) {
            $sourceUrl = 'https://komiku.org/manga/' . Str::slug($title) . '/';
        }

        $fetchRequest = Request::create('', 'POST', ['url' => $sourceUrl]);
        $fetchResponse = app(\App\Http\Controllers\Admin\MangaImporterController::class)->fetch($fetchRequest);
        $fetchStatus = method_exists($fetchResponse, 'getStatusCode') ? $fetchResponse->getStatusCode() : 200;

        if ($fetchStatus < 200 || $fetchStatus >= 300) {
            $payload = json_decode($fetchResponse->getContent(), true) ?: [];
            throw new \RuntimeException($payload['error'] ?? ('Auto import manga gagal | HTTP ' . $fetchStatus));
        }

        $payload = json_decode($fetchResponse->getContent(), true) ?: [];
        if (empty($payload['title'])) {
            throw new \RuntimeException('Auto import manga gagal: data manga kosong');
        }

        $storeRequest = Request::create('', 'POST', [
            'title' => $payload['title'],
            'synopsis' => $payload['synopsis'] ?? null,
            'poster' => $payload['poster'] ?? null,
            'type' => $payload['type'] ?? 'Manga',
            'status' => $payload['status'] ?? 'Ongoing',
            'source_url' => $payload['raw_url'] ?? $sourceUrl,
            'author' => $payload['author'] ?? '-',
            'artist' => $payload['artist'] ?? '-',
            'genres' => $payload['genres'] ?? [],
            'import_chapters' => false,
        ]);

        $storeResponse = app(\App\Http\Controllers\Admin\MangaImporterController::class)->store($storeRequest);
        $storeStatus = method_exists($storeResponse, 'getStatusCode') ? $storeResponse->getStatusCode() : 200;

        if ($storeStatus < 200 || $storeStatus >= 300) {
            $storePayload = json_decode($storeResponse->getContent(), true) ?: [];
            throw new \RuntimeException($storePayload['error'] ?? ('Simpan manga gagal | HTTP ' . $storeStatus));
        }

        $stored = json_decode($storeResponse->getContent(), true) ?: [];
        $manga = !empty($stored['id']) ? Manga::find($stored['id']) : Manga::where('slug', Str::slug($payload['title']))->first();

        if (!$manga) {
            throw new \RuntimeException('Manga berhasil di-fetch tapi tidak ditemukan setelah disimpan');
        }

        return $manga;
    }

    private function getMissingChaptersForManga(Manga $manga): array
    {
        if (!$manga->source_url) {
            throw new \RuntimeException('Source URL tidak ditemukan');
        }

        $settings = [];
        if (Storage::disk('public')->exists('settings.json')) {
            $settings = json_decode(Storage::disk('public')->get('settings.json'), true) ?? [];
        }
        $apiBaseUrl = rtrim($settings['kanna_api_url'] ?? 'https://api.satulagi.my.id', '/');

        $urlPath = parse_url($manga->source_url, PHP_URL_PATH);
        $segments = array_filter(explode('/', (string)$urlPath));
        $slug = end($segments);

        if (!$slug) {
            throw new \RuntimeException('Slug tidak valid dari Source URL');
        }

        $apiUrl = "{$apiBaseUrl}/api/manga/detail-komik/{$slug}";
        $response = Http::withoutVerifying()->timeout(30)->get($apiUrl);

        if ($response->failed()) {
            throw new \RuntimeException('Gagal mengambil data dari API | HTTP ' . $response->status());
        }

        $data = $response->json();
        $scrapedChapters = $data['chapters'] ?? [];
        $existingNumbers = $manga->chapters()->pluck('chapter_number')->map(fn ($n) => (float)$n)->toArray();

        $missingChapters = [];
        foreach ($scrapedChapters as $ch) {
            $rawNum = (string)($ch['chapterNumber'] ?? 0);
            $num = (float) str_replace(['-', ','], '.', $rawNum);

            if (!in_array($num, $existingNumbers, true)) {
                $missingChapters[] = [
                    'number' => $num,
                    'title' => $ch['title'] ?? ('Chapter ' . $num),
                    'url' => $ch['originalLink'] ?? ($manga->source_url . 'chapter-' . str_replace('.', '-', (string)$num)),
                ];
            }
        }

        return $missingChapters;
    }

    private function importMissingChapterForManga(Manga $manga, array $chapter): void
    {
        $importRequest = Request::create('', 'POST', [
            'url' => $chapter['url'],
            'number' => $chapter['number'],
            'title' => $chapter['title'] ?? ('Chapter ' . $chapter['number']),
        ]);

        $response = app(\App\Http\Controllers\Admin\MangaImporterController::class)->importChapter($importRequest, $manga);
        $status = method_exists($response, 'getStatusCode') ? $response->getStatusCode() : 200;

        if ($status < 200 || $status >= 300) {
            $payload = json_decode($response->getContent(), true) ?: [];
            throw new \RuntimeException($payload['error'] ?? 'Chapter import failed');
        }
    }

    private function writeMangaFailedLog(string $title, string $error): void
    {
        $path = storage_path('logs/manga-update-failed.log');
        $content = '[' . now()->format('Y-m-d H:i:s') . "]\n" . $title . "\nError: " . $error . "\n\n";
        file_put_contents($path, $content, FILE_APPEND | LOCK_EX);
    }

    private function clearMangaFailedLog(): void
    {
        file_put_contents(storage_path('logs/manga-update-failed.log'), '');
    }

    private function readMangaFailedLogs(): array
    {
        $path = storage_path('logs/manga-update-failed.log');
        if (!file_exists($path)) {
            return [];
        }

        $raw = trim((string)file_get_contents($path));
        if ($raw === '') {
            return [];
        }

        $entries = preg_split('/\n\s*\n/', $raw) ?: [];
        $logs = [];

        foreach ($entries as $entry) {
            $lines = array_values(array_filter(array_map('trim', explode("\n", $entry)), fn ($line) => $line !== ''));
            $time = isset($lines[0]) ? trim($lines[0], '[]') : '';
            $title = $lines[1] ?? '-';
            $error = isset($lines[2]) ? preg_replace('/^Error:\s*/i', '', $lines[2]) : '-';

            $logs[] = [
                'time' => $time,
                'title' => $title,
                'error' => $error,
            ];
        }

        return array_reverse($logs);
    }

    /**
     * Proxy gambar untuk halaman admin chapter.
     * Hanya URL publik http(s), tanpa redirect, dan hanya respons bertipe gambar
     * (mencegah SSRF ke jaringan internal dan penyajian HTML/skrip).
     */
    public function proxy(Request $request)
    {
        $url = (string) $request->query('url', '');
        $parts = parse_url($url);
        $scheme = strtolower($parts['scheme'] ?? '');
        $host = $parts['host'] ?? '';

        if (!in_array($scheme, ['http', 'https'], true) || $host === '' || isset($parts['user'])) {
            abort(404);
        }

        // Semua IP host harus publik; IP yang sudah dicek dipakai langsung (anti DNS rebinding).
        $ips = filter_var($host, FILTER_VALIDATE_IP) ? [$host] : (gethostbynamel($host) ?: []);
        $public = array_filter($ips, fn ($ip) => filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE));
        if (!$ips || count($public) !== count($ips)) {
            abort(404);
        }
        $port = $parts['port'] ?? ($scheme === 'https' ? 443 : 80);

        try {
            $response = Http::timeout(20)
                ->withOptions([
                    'allow_redirects' => false,
                    'curl' => [CURLOPT_RESOLVE => ["{$host}:{$port}:{$ips[0]}"]],
                ])
                ->get($url);

            $type = strtolower((string) $response->header('Content-Type'));
            $body = $response->body();

            if ($response->successful() && str_starts_with($type, 'image/') && !str_contains($type, 'svg')
                && strlen($body) > 0 && strlen($body) <= 20 * 1024 * 1024) {
                return response($body, 200)
                    ->header('Content-Type', $type)
                    ->header('X-Content-Type-Options', 'nosniff')
                    ->header('Cache-Control', 'private, max-age=86400');
            }
        } catch (\Exception $e) {
            Log::warning('Image proxy error: ' . $e->getMessage(), ['url' => $url]);
        }

        abort(404);
    }
}
