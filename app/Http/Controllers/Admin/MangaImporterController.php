<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Manga;
use App\Models\Chapter;
use App\Models\ChapterImage;
use App\Models\Genre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class MangaImporterController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Manga/Import');
    }

    public function fetch(Request $request)
    {
        set_time_limit(0); 
        ini_set('memory_limit', '512M');
        
        $request->validate([
            'url' => ['required', 'url']
        ]);

        try {
            $settings = [];
            if (Storage::disk('public')->exists('settings.json')) {
                $settings = json_decode(Storage::disk('public')->get('settings.json'), true) ?? [];
            }
            $apiBaseUrl = rtrim($settings['kanna_api_url'] ?? 'https://api.satulagi.my.id', '/');

            // Extract slug from Komiku URL
            // Example: https://komiku.org/manga/solo-leveling/ -> solo-leveling
            $urlPath = parse_url($request->url, PHP_URL_PATH);
            $segments = array_filter(explode('/', $urlPath));
            $slug = end($segments);

            if (!$slug) {
                return response()->json(['error' => 'URL tidak valid. Pastikan URL komik dari Komiku benar.'], 422);
            }

            $apiUrl = "{$apiBaseUrl}/api/manga/detail-komik/{$slug}";
            $response = Http::withoutVerifying()
                ->timeout(30)
                ->get($apiUrl);

            // Fallback: If 404, try append -id or -sub-indo if needed, but usually search is better.
            // For now, let's just use the direct response.
            if ($response->failed()) {
                $errorData = $response->json();
                $errorMessage = $errorData['error'] ?? ($errorData['message'] ?? 'Status ' . $response->status());
                $detail = $errorData['detail'] ?? '';
                
                return response()->json([
                    'error' => 'API Kanna Gagal: ' . $errorMessage . ($detail ? ' (' . $detail . ')' : ''),
                    'status' => $response->status()
                ], 422);
            }

            $data = $response->json();
            
            if (!($data['status'] ?? true)) {
                return response()->json(['error' => 'API Kanna Error: ' . ($data['message'] ?? 'Unknown Error')], 422);
            }

            // Map API data to Hestia structure
            $title = trim($data['title'] ?? 'No Title');
            
            // Fix double title issue (e.g. "TitleTitle")
            if (strlen($title) > 0 && strlen($title) % 2 === 0) {
                $halfLen = strlen($title) / 2;
                $firstHalf = substr($title, 0, $halfLen);
                $secondHalf = substr($title, $halfLen);
                if ($firstHalf === $secondHalf) {
                    $title = $firstHalf;
                }
            }

            $synopsis = $data['description'] ?? $data['sinopsis'] ?? '';
            $poster = $data['thumbnail'] ?? '';
            
            $info = $data['info'] ?? [];
            $scrapedTypeRaw = $info['Tipe:'] ?? $info['Tipe'] ?? $info['Jenis Komik:'] ?? $info['Jenis Komik'] ?? $info['Jenis:'] ?? $info['Jenis'] ?? 'Manga';
            $scrapedTypeRaw = trim($scrapedTypeRaw);
            
            $scrapedType = 'Manga';
            if (stripos($scrapedTypeRaw, 'Manhwa') !== false || stripos($scrapedTypeRaw, 'Korea') !== false) {
                $scrapedType = 'Manhwa';
            } elseif (stripos($scrapedTypeRaw, 'Manhua') !== false || stripos($scrapedTypeRaw, 'China') !== false || stripos($scrapedTypeRaw, 'Cina') !== false) {
                $scrapedType = 'Manhua';
            }

            $chapters = [];
            if (!empty($data['chapters'])) {
                foreach ($data['chapters'] as $ch) {
                    $rawNum = (string)($ch['chapterNumber'] ?? 0);
                    $num = (float) str_replace(['-', ','], '.', $rawNum);
                    
                    $chapters[] = [
                        'title' => $ch['title'] ?? ('Chapter ' . $num),
                        'url' => $ch['originalLink'] ?? ($request->url . 'chapter-' . str_replace('.', '-', $num)),
                        'number' => $num,
                        'date' => $ch['date'] ?? ''
                    ];
                }
            }

            return response()->json([
                'title' => $title,
                'synopsis' => $synopsis,
                'poster' => $poster,
                'type' => $scrapedType,
                'status' => $info['Status'] ?? 'Ongoing',
                'author' => $info['Pengarang'] ?? '-',
                'artist' => $info['Ilustrator'] ?? '-',
                'genres' => $data['genres'] ?? [],
                'chapters_count' => count($chapters),
                'chapters' => $chapters, // API already provides them in order
                'raw_url' => $request->url
            ]);

        } catch (\Exception $e) {
            Log::error('Importer Fetch Error', [
                'message' => $e->getMessage(),
                'line' => $e->getLine()
            ]);
            return response()->json(['error' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'synopsis' => 'nullable|string',
            'poster' => 'nullable|string',
            'type' => 'required|string',
            'status' => 'required|string',
            'source_url' => 'nullable|url',
            'author' => 'nullable|string',
            'artist' => 'nullable|string',
            'genres' => 'array',
            'import_chapters' => 'boolean'
        ]);

        $slug = Str::slug($data['title']);
        $mangaData = [
            'title' => $data['title'],
            'synopsis' => $data['synopsis'],
            'type' => $data['type'],
            'status' => $data['status'],
            'source_url' => $data['source_url'] ?? null,
            'author' => $data['author'],
            'artist' => $data['artist'],
            'release_year' => $data['release_year'] ?? date('Y'),
        ];

        // Only update the poster if it's provided, so we don't overwrite existing ones with null.
        if (!empty($data['poster'])) {
            $mangaData['poster'] = $data['poster'];
        } elseif (!Manga::where('slug', $slug)->exists()) {
            // If it's a new manga and no poster was scraped, use a fallback layout placeholder so DB doesn't complain about null.
            $mangaData['poster'] = '/img/no-poster.png';
        }

        $manga = Manga::updateOrCreate(
            ['slug' => $slug],
            $mangaData
        );

        // Genres
        if (!empty($data['genres'])) {
            $genreIds = [];
            foreach ($data['genres'] as $gName) {
                $genre = Genre::firstOrCreate(
                    ['slug' => Str::slug($gName)],
                    ['name' => $gName]
                );
                $genreIds[] = $genre->id;
            }
            $manga->genres()->sync($genreIds);
        }

        return response()->json([
            'id' => $manga->id,
            'slug' => $manga->slug,
            'message' => 'Manga imported/updated successfully.'
        ]);
    }

    public function importChapter(Request $request, Manga $manga)
    {
        set_time_limit(0);
        ini_set('memory_limit', '512M');
        $data = $request->validate([
            'url'    => 'required|url',
            'number' => 'required|numeric',
            'title'  => 'nullable|string'
        ]);

        $data['number'] = (float) $data['number'];

        try {
            $settings = [];
            if (Storage::disk('public')->exists('settings.json')) {
                $settings = json_decode(Storage::disk('public')->get('settings.json'), true) ?? [];
            }
            $apiBaseUrl = rtrim($settings['kanna_api_url'] ?? 'https://api.satulagi.my.id', '/');

            // --- Build chapter number (avoid ".0" suffix) ---
            $chapterNum = $data['number'];
            if (floor($chapterNum) == $chapterNum) {
                $chapterNum = (int)$chapterNum;
            }

            // --- Primary Strategy: Pass the actual source URL of the chapter to API ---
            // The API will fetch images from the exact URL Komiku provided in its chapter list.
            $chapterSourceUrl = $data['url']; // e.g. https://komiku.org/solo-leveling-chapter-180/
            $apiUrl = "{$apiBaseUrl}/api/manga/baca-chapter/{$manga->slug}/{$chapterNum}?url=" . urlencode($chapterSourceUrl);

            Log::info("Importing Chapter via URL: " . $apiUrl);

            $response = Http::withoutVerifying()
                ->withHeaders([
                    'User-Agent' => 'HestiaCMS/1.0',
                    'Accept'     => 'application/json',
                ])
                ->timeout(90)
                ->retry(2, 2000)
                ->get($apiUrl);

            $images = [];

            if ($response->successful()) {
                $apiData = $response->json();
                if (!empty($apiData['images'])) {
                    foreach ($apiData['images'] as $img) {
                        if (!empty($img['src'])) {
                            $images[] = $img['src'];
                        }
                    }
                }
            }

            // --- Fallback: Try slug variants if API with URL fails ---
            if (empty($images)) {
                Log::warning("Primary API call failed, trying slug variants...", [
                    'status' => $response->status(),
                    'body'   => $response->body()
                ]);

                $slugVariants = [
                    $manga->slug,
                    preg_replace('/-(id|sub-indo|indo|bahasa-indonesia|manga|komik)$/i', '', $manga->slug),
                ];

                foreach (array_unique($slugVariants) as $slugVariant) {
                    $fallbackUrl = "{$apiBaseUrl}/api/manga/baca-chapter/{$slugVariant}/{$chapterNum}";
                    Log::info("Trying slug variant: " . $fallbackUrl);

                    $fallbackRes = Http::withoutVerifying()
                        ->withHeaders(['Accept' => 'application/json'])
                        ->timeout(60)
                        ->get($fallbackUrl);

                    if ($fallbackRes->successful()) {
                        $fallbackData = $fallbackRes->json();
                        if (!empty($fallbackData['images'])) {
                            foreach ($fallbackData['images'] as $img) {
                                if (!empty($img['src'])) $images[] = $img['src'];
                            }
                            if (!empty($images)) break;
                        }
                    }
                }
            }

            // --- Last Resort: Direct scraping from Komiku ---
            if (empty($images)) {
                Log::info("All API strategies failed. Attempting direct Komiku scrape for: " . $chapterSourceUrl);

                $directRes = Http::withoutVerifying()
                    ->withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Referer'    => 'https://komiku.org/'
                    ])
                    ->timeout(60)
                    ->get($chapterSourceUrl);

                if ($directRes->successful()) {
                    $body = $directRes->body();

                    // Strategy A: #Baca_Komik img
                    preg_match_all('/<div id="Baca_Komik"[^>]*>.*?<\/div>/si', $body, $readerBlocks);
                    $searchBody = !empty($readerBlocks[0]) ? $readerBlocks[0][0] : $body;

                    // Try data-src first (lazy loading), then src
                    preg_match_all('/(?:data-src|src)=["\']([^"\']+\.(?:jpg|jpeg|png|webp|avif)(?:\?[^"\']*)?)["\'](?=[^>]*class="[^"]*(?:lazy|chapter|page|img)[^"]*")?/i', $searchBody, $matches);
                    foreach ($matches[1] ?? [] as $imgUrl) {
                        if (filter_var($imgUrl, FILTER_VALIDATE_URL) && !preg_match('/logo|icon|banner|ads|thumb/i', $imgUrl)) {
                            $images[] = $imgUrl;
                        }
                    }

                    // Dedupe
                    $images = array_values(array_unique($images));
                }
            }

            if (empty($images)) {
                return response()->json([
                    'error'      => 'Tidak ada gambar ditemukan untuk chapter ini setelah mencoba semua strategi.',
                    'debug_url'  => $chapterSourceUrl,
                    'api_url'    => $apiUrl,
                ], 422);
            }

            // Save chapter and images
            $chapter = $manga->chapters()->updateOrCreate(
                ['chapter_number' => $data['number']],
                [
                    'title'      => $data['title'] ?? 'Chapter ' . $data['number'],
                    'slug'       => 'chapter-' . str_replace('.', '-', $data['number']),
                    'source_url' => $chapterSourceUrl,
                ]
            );

            $chapter->images()->delete();
            foreach ($images as $index => $imgUrl) {
                $chapter->images()->create([
                    'image_path' => $imgUrl,
                    'order'      => $index
                ]);
            }

            return response()->json([
                'success'      => true,
                'chapter_id'   => $chapter->id,
                'images_count' => count($images),
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
