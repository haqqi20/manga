<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Anime;
use App\Models\Episode;

class OtakudesuController extends Controller
{
    private function getOtakudesuBaseUrl(): string
    {
        return 'https://otakudesu.blog';
    }

    private function otakudesuGet(string $url, int $timeout = 30)
    {
        return Http::withoutVerifying()
            ->timeout($timeout)
            ->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153.0.0.0 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language' => 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control' => 'no-cache',
                'Pragma' => 'no-cache',
                'Referer' => $this->getOtakudesuBaseUrl() . '/',
            ])
            ->get($url);
    }

    private function createDom(string $html): \DOMDocument
    {
        libxml_use_internal_errors(true);
        $dom = new \DOMDocument();
        $dom->loadHTML('<?xml encoding="UTF-8">' . $html);
        libxml_clear_errors();
        return $dom;
    }

    public function search(Request $request)
    {
        $request->validate(['q' => 'required|string|min:2']);

        try {
            $query = trim($request->input('q'));
            $url = $this->getOtakudesuBaseUrl() . '/?s=' . urlencode($query);
            $response = $this->otakudesuGet($url);

            if ($response->failed()) {
                return response()->json([
                    'error' => 'Gagal menghubungi OtakuDesu. HTTP ' . $response->status(),
                ], 502);
            }

            return response()->json(
                $this->scrapeSearchResults($response->body())
            );
        } catch (\Throwable $e) {
            Log::error('Otakudesu search error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Gagal melakukan pencarian OtakuDesu.',
            ], 500);
        }
    }

    private function scrapeSearchResults(string $html): array
    {
        $dom = $this->createDom($html);
        $xpath = new \DOMXPath($dom);
        $results = [];

        foreach ($xpath->query('//a[@href]') as $node) {
            $href = trim($node->getAttribute('href'));

            if (!$this->isOtakudesuAnimeDetailUrl($href)) {
                continue;
            }

            $title = trim(preg_replace('/\s+/', ' ', $node->textContent ?? ''));
            $title = $this->cleanOtakudesuTitle($title);
            $slug = $this->extractAnimeSlug($href);

            if (!$title || !$slug || $this->isBadOtakudesuTitle($title)) {
                continue;
            }

            $results[] = [
                'title' => $title,
                'slug' => $slug,
                'url' => $this->makeAbsoluteUrl($href),
            ];
        }

        return $this->uniqueAnimeResults($results);
    }

    public function animeDetail(string $slug)
    {
        try {
            $url = $this->getOtakudesuBaseUrl() . '/anime/' . trim($slug, '/') . '/';
            $response = $this->otakudesuGet($url);

            if ($response->failed()) {
                return response()->json([
                    'error' => 'Gagal mengambil detail anime. HTTP ' . $response->status(),
                ], 502);
            }

            return response()->json($this->scrapeAnimeDetail($response->body(), $url));
        } catch (\Throwable $e) {
            Log::error('Otakudesu anime detail error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Gagal mengambil detail anime.',
            ], 500);
        }
    }

    private function scrapeAnimeDetail(string $html, ?string $sourceUrl = null): array
    {
        $dom = $this->createDom($html);
        $xpath = new \DOMXPath($dom);

        $result = [
            'title' => '',
            'episode_list' => [],
            'url' => $sourceUrl,
        ];

        foreach (['//h1', '//div[contains(@class,"jdlrx")]//h1', '//div[contains(@class,"entry-title")]', '//title'] as $query) {
            $node = $xpath->query($query)->item(0);
            if ($node) {
                $title = $this->cleanOtakudesuTitle(
                    trim(preg_replace('/\s+/', ' ', $node->textContent ?? ''))
                );
                if ($title) {
                    $result['title'] = $title;
                    break;
                }
            }
        }

        foreach ($xpath->query('//a[@href]') as $node) {
            $href = trim($node->getAttribute('href'));
            $text = trim(preg_replace('/\s+/', ' ', $node->textContent ?? ''));

            if (!$href || !$text) {
                continue;
            }

            $number = $this->parseEpisodeNumber($text, $href);

            if ($number === null) {
                continue;
            }

            $lower = strtolower($href . ' ' . $text);
            if (str_contains($lower, 'batch') || str_contains($lower, 'pembatas-episode')) {
                continue;
            }

            $episodeSlug = $this->extractEpisodeSlug($href);
            if (!$episodeSlug) {
                continue;
            }

            $result['episode_list'][] = [
                'episode' => $text,
                'number' => $number,
                'slug' => $episodeSlug,
                'url' => $this->makeAbsoluteUrl($href, $sourceUrl),
            ];
        }

        $unique = [];
        foreach ($result['episode_list'] as $episode) {
            $unique[(string) $episode['number']] = $episode;
        }

        $result['episode_list'] = array_values($unique);

        usort($result['episode_list'], fn($a, $b) => $b['number'] <=> $a['number']);

        return $result;
    }

    public function episodeDetail(string $eps)
    {
        try {
            $slug = trim($eps, '/');
            $url = $this->getOtakudesuBaseUrl() . '/' . $slug . '/';
            $response = $this->otakudesuGet($url, 30);

            if ($response->failed()) {
                return response()->json([
                    'error' => 'Gagal mengambil detail episode. HTTP ' . $response->status(),
                ], 502);
            }

            return response()->json($this->scrapeEpisodeDetail($response->body(), $url));
        } catch (\Throwable $e) {
            Log::error('Otakudesu episode detail error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Gagal mengambil detail episode.',
            ], 500);
        }
    }

private function scrapeEpisodeDetail(string $html, ?string $sourceUrl = null): array
    {
        $dom = $this->createDom($html);
        $xpath = new \DOMXPath($dom);

        $result = [
            'episode' => '',
            'stream_url' => null,
            'mirror_streams' => [],
            'download_urls' => [],
            'url' => $sourceUrl,
        ];

        // 1. Ambil Judul Episode
        foreach (['//h1', '//div[contains(@class,"entry-title")]', '//title'] as $query) {
            $node = $xpath->query($query)->item(0);
            if ($node) {
                $title = trim(preg_replace('/\s+/', ' ', $node->textContent ?? ''));
                if ($title) {
                    $result['episode'] = $title;
                    break;
                }
            }
        }

        // 2. Ambil Stream Utama (Iframe Langsung di #pembed)
        $mainStreamUrls = [];
        $iframeNodes = $xpath->query('//div[@id="pembed"]//iframe | //div[contains(@class,"responsive-embed-stream")]//iframe');
        foreach ($iframeNodes as $iframe) {
            $src = trim($iframe->getAttribute('src') ?: $iframe->getAttribute('data-src'));
            if ($src && !preg_match('/(youtube|facebook|twitter|instagram)\.com/i', $src)) {
                $mainStreamUrls[] = $this->makeAbsoluteUrl($src, $sourceUrl);
            }
        }

$mirrorNodes = $xpath->query(
    '//div[contains(@class,"mirrorstream")]//ul[contains(@class,"m360p") or contains(@class,"m480p") or contains(@class,"m720p")]//li/a[@data-content]'
);

foreach ($mirrorNodes as $a) {
    $provider = trim(preg_replace('/\s+/', ' ', $a->textContent));
    $dataContent = trim($a->getAttribute('data-content'));
    $isDefault = strtolower(trim($a->getAttribute('data-default'))) === 'true';

    // Cari parent UL
    $parentUl = $a->parentNode;

    while ($parentUl && strtolower($parentUl->nodeName) !== 'ul') {
        $parentUl = $parentUl->parentNode;
    }

    $quality = null;

    if ($parentUl && $parentUl->hasAttribute('class')) {
        $class = $parentUl->getAttribute('class');

        if (preg_match('/\bm(\d{3,4}p)\b/i', $class, $match)) {
            $quality = strtolower($match[1]);
        }
    }

    if (!$dataContent) {
        continue;
    }

    $resolvedUrl = $this->resolveOtakudesuMirrorUrl(
        $dataContent,
        $sourceUrl,
        $html
    );

    if (!$resolvedUrl) {
        continue;
    }

    $streamUrl = $this->proxyDesuStreamUrl($resolvedUrl);

    $result['mirror_streams'][] = [
        'provider' => strtolower($provider),
        'quality' => $quality,
        'stream_url' => $streamUrl,
        'url' => $streamUrl,
        'original_url' => $resolvedUrl,
        'default' => $isDefault,
    ];
}

        // Sisipkan Stream Utama ke urutan paling atas
        foreach (array_reverse($mainStreamUrls) as $sUrl) {
            $proxied = $this->proxyDesuStreamUrl($sUrl);
            array_unshift($result['mirror_streams'], [
                'provider' => 'Server Utama',
                'quality' => 'Default',
                'stream_url' => $proxied,
                'url' => $proxied,
                'payload' => null,
            ]);
        }

        if (!empty($result['mirror_streams'])) {
            $result['stream_url'] = $result['mirror_streams'][0]['stream_url'];
        }

        // 4. Ambil Link Download (div.download li)
        $downloadNodes = $xpath->query('//div[contains(@class,"download")]//li');
        if ($downloadNodes->length > 0) {
            foreach ($downloadNodes as $li) {
                $resolution = '';
                $strong = $xpath->query('./strong | ./b', $li)->item(0);
                if ($strong) {
                    $resolution = trim($strong->textContent);
                }

                $links = $xpath->query('./a', $li);
                foreach ($links as $a) {
                    $href = trim($a->getAttribute('href'));
                    $providerName = trim($a->textContent);

                    if ($href && $providerName) {
                        $result['download_urls'][] = [
                            'label' => trim($resolution . ' - ' . $providerName),
                            'url' => $this->makeAbsoluteUrl($href, $sourceUrl),
                        ];
                    }
                }
            }
        }

        return $result;
    }

private function resolveOtakudesuMirrorUrl(
    string $dataContent,
    ?string $sourceUrl,
    string $rawHtml
): ?string {
    $decoded = base64_decode($dataContent, true);

    if ($decoded === false || empty($decoded)) {
        Log::warning('Otakudesu mirror: gagal decode data-content');
        return null;
    }

    $payload = json_decode($decoded, true);

    if (
        !is_array($payload) ||
        !isset($payload['id'], $payload['i'], $payload['q'])
    ) {
        Log::warning('Otakudesu mirror: payload tidak valid', [
            'decoded' => $decoded,
        ]);

        return null;
    }

    $baseUrl = $this->getOtakudesuBaseUrl();
    $ajaxUrl = rtrim($baseUrl, '/') . '/wp-admin/admin-ajax.php';

    try {
        /*
         * ============================================================
         * STEP 1
         * Ambil nonce dari OtakuDesu
         * ============================================================
         */

        $nonceResponse = Http::withoutVerifying()
            ->timeout(10)
            ->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
                'Accept' => 'application/json, text/javascript, */*; q=0.01',
                'Referer' => $sourceUrl ?: $baseUrl,
                'Origin' => $baseUrl,
                'X-Requested-With' => 'XMLHttpRequest',
            ])
            ->asForm()
            ->post($ajaxUrl, [
                'action' => 'aa1208d27f29ca340c92c66d1926f13f',
            ]);

        if (!$nonceResponse->successful()) {
            Log::warning('Otakudesu mirror: request nonce gagal', [
                'status' => $nonceResponse->status(),
                'body' => $nonceResponse->body(),
            ]);

            return null;
        }

        $nonceJson = $nonceResponse->json();

        /*
         * Response normal:
         *
         * {
         *     "success": true,
         *     "data": "...."
         * }
         */

        $nonce = $nonceJson['data'] ?? null;

        if (!is_string($nonce) || trim($nonce) === '') {
            Log::warning('Otakudesu mirror: nonce kosong', [
                'response' => $nonceResponse->body(),
            ]);

            return null;
        }

        /*
         * ============================================================
         * STEP 2
         * Request mirror menggunakan nonce
         * ============================================================
         */

        $mirrorResponse = Http::withoutVerifying()
            ->timeout(10)
            ->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
                'Accept' => 'application/json, text/javascript, */*; q=0.01',
                'Referer' => $sourceUrl ?: $baseUrl,
                'Origin' => $baseUrl,
                'X-Requested-With' => 'XMLHttpRequest',
            ])
            ->asForm()
            ->post($ajaxUrl, [
                'id' => $payload['id'],
                'i' => $payload['i'],
                'q' => $payload['q'],
                'nonce' => $nonce,
                'action' => '2a3505c93b0035d3f455df82bf976b84',
            ]);

        if (!$mirrorResponse->successful()) {
            Log::warning('Otakudesu mirror: request mirror gagal', [
                'status' => $mirrorResponse->status(),
                'payload' => $payload,
                'body' => $mirrorResponse->body(),
            ]);

            return null;
        }

        /*
         * ============================================================
         * STEP 3
         * Ambil data dari response AJAX
         * ============================================================
         */

        $mirrorJson = $mirrorResponse->json();

        $encodedHtml = $mirrorJson['data'] ?? null;

        if (!is_string($encodedHtml) || trim($encodedHtml) === '') {
            Log::warning('Otakudesu mirror: response data kosong', [
                'payload' => $payload,
                'response' => $mirrorResponse->body(),
            ]);

            return null;
        }

        /*
         * ============================================================
         * STEP 4
         * Decode HTML player
         * ============================================================
         */

        $playerHtml = base64_decode($encodedHtml, true);

        if ($playerHtml === false || trim($playerHtml) === '') {
            Log::warning('Otakudesu mirror: gagal decode player HTML', [
                'payload' => $payload,
            ]);

            return null;
        }

        /*
         * ============================================================
         * STEP 5
         * Cari iframe
         * ============================================================
         */

        if (preg_match(
            '/<iframe[^>]+src=["\']([^"\']+)["\']/i',
            $playerHtml,
            $match
        )) {
            $iframeUrl = trim(html_entity_decode($match[1]));

            if ($iframeUrl !== '') {
                return $this->makeAbsoluteUrl(
                    $iframeUrl,
                    $sourceUrl ?: $baseUrl
                );
            }
        }

        /*
         * Beberapa response bisa saja menggunakan embed.
         */

        if (preg_match(
            '/<embed[^>]+src=["\']([^"\']+)["\']/i',
            $playerHtml,
            $match
        )) {
            $embedUrl = trim(html_entity_decode($match[1]));

            if ($embedUrl !== '') {
                return $this->makeAbsoluteUrl(
                    $embedUrl,
                    $sourceUrl ?: $baseUrl
                );
            }
        }

        /*
         * Kalau response berupa URL langsung.
         */

        $plain = trim(strip_tags($playerHtml));

        if (
            filter_var($plain, FILTER_VALIDATE_URL)
        ) {
            return $plain;
        }

        Log::warning('Otakudesu mirror: URL player tidak ditemukan', [
            'payload' => $payload,
            'player_html' => substr($playerHtml, 0, 1000),
        ]);

    } catch (\Throwable $e) {
        Log::warning('Otakudesu Mirror Fetch Error', [
            'message' => $e->getMessage(),
            'payload' => $payload,
        ]);
    }

    return null;
}

    public function bulkScrape(Request $request, Anime $anime)
    {
        set_time_limit(300);
        ini_set('max_execution_time', '300');

        $request->validate([
            'episodes' => 'required|array|min:1|max:500',
            'episodes.*.slug' => 'required|string',
            'episodes.*.label' => 'nullable|string',
            'mode' => 'nullable|in:full,stub',
        ]);

        $mode = $request->input('mode', 'full');
        $episodes = $request->input('episodes');

        $imported = 0;
        $updated = 0;
        $failed = 0;
        $errors = [];

        foreach ($episodes as $ep) {
            try {
                $slug = trim($ep['slug'] ?? '');
                if (!$slug) {
                    continue;
                }

                $lowerSlug = strtolower($slug);

                if (
                    str_contains($lowerSlug, 'batch') ||
                    str_contains($lowerSlug, 'pembatas-episode')
                ) {
                    continue;
                }

                $number = $this->parseEpisodeNumber($ep['label'] ?? '', $slug);

                if ($number === null) {
                    $isOva =
                        preg_match('/\bova\b/i', $slug) ||
                        preg_match('/\bova\b/i', $ep['label'] ?? '');

                    if ($isOva) {
                        $dbMax = (int) Episode::where('anime_id', $anime->id)
                            ->where('number', '>=', 100000)
                            ->max('number');

                        $number = $dbMax + 1;
                    } else {
                        $failed++;
                        $errors[] = "Tidak bisa parse nomor episode dari: {$slug}";
                        continue;
                    }
                }

                $existing = Episode::where('anime_id', $anime->id)
                    ->where('number', $number)
                    ->first();

                if ($mode === 'full') {
                    $detail = $this->fetchEpisodeDetail($slug);

                    if (!$detail) {
                        $failed++;
                        $errors[] = "Gagal mengambil detail episode #{$number}: {$slug}";
                        continue;
                    }

                    $episodeData = [
                        'anime_id' => $anime->id,
                        'number' => $number,
                        'title' => $this->parseTitle(
                            $detail['episode'] ?? ($ep['label'] ?? ''),
                            $number
                        ),
                        'video_url' => $detail['stream_url'] ?? null,
                        'mirror_streams' => $detail['mirror_streams'] ?? [],
                        'download_urls' => $detail['download_urls'] ?? [],
                        'release_date' => null,
                    ];
                } else {
                    $episodeData = [
                        'anime_id' => $anime->id,
                        'number' => $number,
                        'title' => $this->parseTitle($ep['label'] ?? '', $number),
                    ];
                }

                if ($existing) {
                    $existing->update($episodeData);
                    $updated++;
                } else {
                    Episode::create($episodeData);
                    $imported++;
                }
            } catch (\Throwable $e) {
                $failed++;
                $errors[] = "Error episode " . ($ep['slug'] ?? '-') . ": " . $e->getMessage();
                Log::error('Otakudesu bulk scrape error: ' . $e->getMessage());
            }
        }

        $totalCount = Episode::where('anime_id', $anime->id)->count();

        $anime->update(['episodes_count' => $totalCount]);

        return response()->json([
            'success' => true,
            'imported' => $imported,
            'updated' => $updated,
            'failed' => $failed,
            'errors' => $errors,
            'total' => $totalCount,
        ]);
    }

    public function massUpdatePage()
    {
        return Inertia::render('Admin/Anime/MassUpdate');
    }

    public function ongoingTitles(Request $request)
    {
        $limit = max(1, min((int) $request->input('limit', 20), 200));

        try {
            $titles = $this->fetchOngoingTitlesFromOtakudesu($limit);

            return response()->json([
                'success' => true,
                'titles' => $titles,
                'total' => count($titles),
            ]);
        } catch (\Throwable $e) {
            Log::error('Otakudesu ongoing title fetch failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil title dari OtakuDesu: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function fetchOngoingTitlesFromOtakudesu(int $limit): array
    {
        $url = $this->getOtakudesuBaseUrl() . '/ongoing-anime/';
        $response = $this->otakudesuGet($url, 30);

        if ($response->failed()) {
            throw new \RuntimeException('HTTP status ' . $response->status());
        }

        $dom = $this->createDom($response->body());
        $xpath = new \DOMXPath($dom);
        $items = [];

        foreach ($xpath->query('//a[@href]') as $node) {
            $href = trim($node->getAttribute('href'));

            if (!$this->isOtakudesuAnimeDetailUrl($href)) {
                continue;
            }

            $title = trim(preg_replace('/\s+/', ' ', $node->textContent ?? ''));
            $title = $this->cleanOtakudesuTitle($title);

            if ($title && !$this->isBadOtakudesuTitle($title)) {
                $items[] = $title;
            }

            if (count(array_unique($items)) >= $limit) {
                break;
            }
        }

        return array_slice(array_values(array_unique($items)), 0, $limit);
    }

    public function massUpdateLatest(Request $request)
    {
        set_time_limit(600);
        ini_set('max_execution_time', '600');

        $request->validate([
            'titles' => 'required|array|min:1|max:200',
            'titles.*' => 'required|string',
            'mode' => 'nullable|in:full,stub',
        ]);

        $mode = $request->input('mode', 'full');

        $titles = array_values(array_unique(array_filter(
            array_map('trim', $request->input('titles', []))
        )));

        $summary = [
            'processed' => 0,
            'found' => 0,
            'imported' => 0,
            'updated' => 0,
            'failed' => 0,
        ];

        $logs = [];

        foreach ($titles as $title) {
            $summary['processed']++;

            try {
                $anime = $this->findLocalAnimeByTitle($title);

                if (!$anime) {
                    $summary['failed']++;
                    $logs[] = [
                        'title' => $title,
                        'status' => 'failed',
                        'message' => 'Anime tidak ditemukan di admin',
                    ];
                    continue;
                }

                $summary['found']++;

                $searchResults = $this->searchOtakudesuByTitle($title);
                $selected = $this->pickBestSearchResult($searchResults, $title);

                if (!$selected || empty($selected['slug'])) {
                    $summary['failed']++;
                    $logs[] = [
                        'title' => $title,
                        'anime_id' => $anime->id,
                        'status' => 'failed',
                        'message' => 'Anime tidak ditemukan di OtakuDesu',
                    ];
                    continue;
                }

                $detail = $this->getOtakudesuAnimeDetailArray($selected['slug']);

                if (!$detail) {
                    $summary['failed']++;
                    $logs[] = [
                        'title' => $title,
                        'anime_id' => $anime->id,
                        'status' => 'failed',
                        'message' => 'Gagal mengambil detail anime OtakuDesu',
                    ];
                    continue;
                }

                $latestEpisode = $this->pickLatestEpisode(
                    $detail['episode_list'] ?? []
                );

                if (!$latestEpisode || empty($latestEpisode['slug'])) {
                    $summary['failed']++;
                    $logs[] = [
                        'title' => $title,
                        'anime_id' => $anime->id,
                        'status' => 'failed',
                        'message' => 'Episode terbaru tidak ditemukan',
                    ];
                    continue;
                }

                $result = $this->importSingleEpisodeForAnime(
                    $anime,
                    $latestEpisode,
                    $mode
                );

                if (($result['status'] ?? '') === 'created') {
                    $summary['imported']++;
                } elseif (($result['status'] ?? '') === 'updated') {
                    $summary['updated']++;
                } else {
                    $summary['failed']++;
                }

                $logs[] = [
                    'title' => $title,
                    'anime_id' => $anime->id,
                    'anime_title' => $anime->title,
                    'otakudesu_title' => $selected['title'] ?? null,
                    'episode' => $latestEpisode['episode'] ?? $latestEpisode['slug'],
                    'status' => $result['status'] ?? 'failed',
                    'message' => $result['message'] ?? 'Selesai',
                ];
            } catch (\Throwable $e) {
                $summary['failed']++;
                $logs[] = [
                    'title' => $title,
                    'status' => 'failed',
                    'message' => $e->getMessage(),
                ];
                Log::error('Otakudesu mass update error: ' . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'summary' => $summary,
            'logs' => $logs,
        ]);
    }

    private function searchOtakudesuByTitle(string $title): array
    {
        try {
            $query = $this->cleanOtakudesuTitle($title);
            $url = $this->getOtakudesuBaseUrl() . '/?s=' . urlencode($query);
            $response = $this->otakudesuGet($url, 25);

            if ($response->failed()) {
                return [];
            }

            return $this->scrapeSearchResults($response->body());
        } catch (\Throwable $e) {
            Log::error('Otakudesu title search error: ' . $e->getMessage());
            return [];
        }
    }

    private function pickBestSearchResult(array $results, string $title): ?array
    {
        if (empty($results)) {
            return null;
        }

        $target = $this->normalizeAnimeTitle($title);

        foreach ($results as $result) {
            $candidate = $this->normalizeAnimeTitle($result['title'] ?? '');
            if ($candidate === $target) {
                return $result;
            }
        }

        foreach ($results as $result) {
            $candidate = $this->normalizeAnimeTitle($result['title'] ?? '');

            if (
                str_contains($candidate, $target) ||
                str_contains($target, $candidate)
            ) {
                return $result;
            }
        }

        return $results[0] ?? null;
    }

    private function getOtakudesuAnimeDetailArray(string $slug): ?array
    {
        try {
            $url = $this->getOtakudesuBaseUrl() . '/anime/' . trim($slug, '/') . '/';
            $response = $this->otakudesuGet($url, 30);

            if ($response->failed()) {
                return null;
            }

            return $this->scrapeAnimeDetail($response->body(), $url);
        } catch (\Throwable $e) {
            Log::error('Otakudesu anime detail scraper error: ' . $e->getMessage());
            return null;
        }
    }

    private function pickLatestEpisode(array $episodeList): ?array
    {
        $filtered = array_values(array_filter($episodeList, function ($ep) {
            $slug = strtolower($ep['slug'] ?? '');

            return $slug &&
                !str_contains($slug, 'batch') &&
                !str_contains($slug, 'pembatas-episode');
        }));

        if (empty($filtered)) {
            return null;
        }

        $best = null;
        $bestNumber = -1;

        foreach ($filtered as $ep) {
            $number = $this->parseEpisodeNumber(
                $ep['episode'] ?? '',
                $ep['slug'] ?? ''
            );

            if ($number !== null && $number > $bestNumber) {
                $best = $ep;
                $bestNumber = $number;
            }
        }

        return $best ?: $filtered[0];
    }

    private function importSingleEpisodeForAnime(
        Anime $anime,
        array $ep,
        string $mode = 'full'
    ): array {
        $number = $this->parseEpisodeNumber(
            $ep['episode'] ?? '',
            $ep['slug'] ?? ''
        );

        if ($number === null) {
            return [
                'status' => 'failed',
                'message' => 'Tidak bisa parse nomor episode',
            ];
        }

        $existing = Episode::where('anime_id', $anime->id)
            ->where('number', $number)
            ->first();

        if ($mode === 'full') {
            $detail = $this->fetchEpisodeDetail($ep['slug']);

            if (!$detail) {
                return [
                    'status' => 'failed',
                    'message' => 'Gagal fetch detail episode',
                ];
            }

            $episodeData = [
                'anime_id' => $anime->id,
                'number' => $number,
                'title' => $this->parseTitle(
                    $detail['episode'] ?? ($ep['episode'] ?? ''),
                    $number
                ),
                'video_url' => $detail['stream_url'] ?? null,
                'mirror_streams' => $detail['mirror_streams'] ?? [],
                'download_urls' => $detail['download_urls'] ?? [],
                'release_date' => null,
            ];
        } else {
            $episodeData = [
                'anime_id' => $anime->id,
                'number' => $number,
                'title' => $this->parseTitle(
                    $ep['episode'] ?? '',
                    $number
                ),
            ];
        }

        if ($existing) {
            $existing->update($episodeData);
            $status = 'updated';
        } else {
            Episode::create($episodeData);
            $status = 'created';
        }

        $totalCount = Episode::where('anime_id', $anime->id)->count();

        $anime->update([
            'episodes_count' => $totalCount,
        ]);

        return [
            'status' => $status,
            'message' => 'Episode #' . $number . ' berhasil diproses',
        ];
    }

    private function fetchEpisodeDetail(string $slug): ?array
    {
        try {
            $slug = trim($slug, '/');
            $url = $this->getOtakudesuBaseUrl() . '/' . $slug . '/';
            $response = $this->otakudesuGet($url, 30);

            if ($response->failed()) {
                Log::error(
                    "Otakudesu detail fetch failed for {$slug}: HTTP " .
                    $response->status()
                );
                return null;
            }

            return $this->scrapeEpisodeDetail($response->body(), $url);
        } catch (\Throwable $e) {
            Log::error(
                "Otakudesu detail fetch error for {$slug}: " .
                $e->getMessage()
            );
            return null;
        }
    }

    private function makeAbsoluteUrl(
        string $url,
        ?string $baseUrl = null
    ): string {
        $url = trim($url);

        if (!$url) {
            return '';
        }

        if (str_starts_with($url, '//')) {
            return 'https:' . $url;
        }

        if (
            str_starts_with($url, 'http://') ||
            str_starts_with($url, 'https://')
        ) {
            return $url;
        }

        if (str_starts_with($url, '/')) {
            return $this->getOtakudesuBaseUrl() . $url;
        }

        if ($baseUrl) {
            $basePath = parse_url($baseUrl, PHP_URL_PATH) ?: '/';
            $directory = rtrim(dirname($basePath), '/');

            return $this->getOtakudesuBaseUrl() . '/' .
                ltrim($directory . '/' . $url, '/');
        }

        return $this->getOtakudesuBaseUrl() . '/' . ltrim($url, '/');
    }

    private function extractAnimeSlug(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH) ?: '';
        $path = trim($path, '/');

        if (str_starts_with($path, 'anime/')) {
            $path = substr($path, strlen('anime/'));
        }

        return trim($path, '/');
    }

    private function extractEpisodeSlug(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH) ?: '';
        return trim($path, '/');
    }

private function isOtakudesuAnimeDetailUrl(string $href): bool
    {
        $href = trim($href);

        if (
            $href === '' ||
            str_starts_with($href, '#') ||
            str_starts_with($href, 'javascript:')
        ) {
            return false;
        }

        $host = parse_url($href, PHP_URL_HOST);
        $path = parse_url($href, PHP_URL_PATH) ?: '';

        if (
            $host &&
            !preg_match('/(^|\.)otakudesu\.blog$/i', $host)
        ) {
            return false;
        }

        // HANYA izinkan URL yang memiliki path '/anime/' (Ini adalah format detail anime OtakuDesu)
        if (preg_match('#^/anime/[^/]+/?$#i', $path)) {
            return true;
        }

        // PERBAIKAN: Ubah menjadi FALSE agar URL episode (yang berakhiran -sub-indo) 
        // tidak ikut terambil saat melakukan pencarian judul.
        if (preg_match('#/[^/]+-sub-indo/?$#i', $path)) {
            return false; 
        }

        return false;
    }

    private function cleanOtakudesuTitle(?string $title): string
    {
        $title = trim((string) $title);

        $title = html_entity_decode(
            $title,
            ENT_QUOTES | ENT_HTML5,
            'UTF-8'
        );

        $title = preg_replace('/\s+/', ' ', $title);

        $title = preg_replace(
            '/\s+(Subtitle Indonesia|Sub Indo|Sub-Indo|Batch)$/i',
            '',
            $title
        );

        $title = preg_replace(
            '/\s+\[(TV|Movie|OVA|ONA|Special)\]$/i',
            '',
            $title
        );

        return trim($title);
    }

    private function isBadOtakudesuTitle(string $title): bool
    {
        $bad = [
            'anime',
            'ongoing anime',
            'completed anime',
            'episode terbaru',
            'jadwal rilis',
            'home',
            'genre',
            'anime list',
            'grup fb',
            'cara download',
            'dmca',
            'lapor link',
            'on-going anime',
            'genre list',
            'sukai halamannya ya',
            'about',
            'tips',
            'info',
        ];

        $lower = strtolower($title);

        if (in_array($lower, $bad, true)) {
            return true;
        }

        if (mb_strlen($title) < 3 || mb_strlen($title) > 160) {
            return true;
        }

        if (preg_match(
            '/^(senin|selasa|rabu|kamis|jumat|sabtu|minggu)$/i',
            $title
        )) {
            return true;
        }

        if (preg_match(
            '/^(page|pages|berikutnya|previous|next|otaku desu|nonton anime)$/i',
            $title
        )) {
            return true;
        }

        if (preg_match(
            '/facebook|rebrand|bookmark|copyright|wordpress|download/i',
            $title
        )) {
            return true;
        }

        return false;
    }

    private function normalizeAnimeTitle(string $title): string
    {
        $title = $this->cleanOtakudesuTitle($title);
        $title = strtolower($title);
        $title = preg_replace('/[^a-z0-9]+/i', ' ', $title);

        return trim(preg_replace('/\s+/', ' ', $title));
    }

    private function findLocalAnimeByTitle(string $title): ?Anime
    {
        $clean = $this->cleanOtakudesuTitle($title);
        $normalizedTarget = $this->normalizeAnimeTitle($clean);

        $anime = Anime::where('title', $clean)->first();
        if ($anime) {
            return $anime;
        }

        $anime = Anime::where('title', 'like', '%' . $clean . '%')->first();
        if ($anime) {
            return $anime;
        }

        $short = trim(
            preg_replace(
                '/\s+(Season|S)\s*\d+.*$/i',
                '',
                $clean
            )
        );

        if ($short && $short !== $clean) {
            $anime = Anime::where('title', 'like', '%' . $short . '%')->first();
            if ($anime) {
                return $anime;
            }
        }

        $prefix = mb_substr($clean, 0, 8);

        if (!$prefix) {
            return null;
        }

        $candidates = Anime::select('id', 'title')
            ->where('title', 'like', '%' . $prefix . '%')
            ->limit(50)
            ->get();

        foreach ($candidates as $candidate) {
            $local = $this->normalizeAnimeTitle($candidate->title);

            if (
                $local === $normalizedTarget ||
                str_contains($local, $normalizedTarget) ||
                str_contains($normalizedTarget, $local)
            ) {
                return Anime::find($candidate->id);
            }
        }

        return null;
    }

    private function uniqueAnimeResults(array $results): array
    {
        $unique = [];

        foreach ($results as $item) {
            $slug = $item['slug'] ?? '';

            if (!$slug) {
                continue;
            }

            $unique[strtolower($slug)] = $item;
        }

        return array_values($unique);
    }

    private function parseEpisodeNumber(
        string $label,
        string $slug
    ): ?int {
        $isOva =
            preg_match('/\bova\b/i', $slug) ||
            preg_match('/\bova\b/i', $label);

        $parsed = null;

        if (preg_match(
            '/(?:Episode|Eps|Ep)\s*\.?\s*(\d+)/i',
            $label,
            $m
        )) {
            $parsed = (int) $m[1];
        }

        if ($isOva) {
            if (
                $parsed === null &&
                preg_match('/ova[\s-]*(\d+)/i', $slug, $m)
            ) {
                $parsed = (int) $m[1];
            }

            if ($parsed !== null) {
                return 100000 + $parsed;
            }

            return null;
        }

        if ($parsed !== null) {
            return $parsed;
        }

        if (preg_match(
            '/(?:episode|eps|ep|cap)-?(\d+)/i',
            $slug,
            $m
        )) {
            return (int) $m[1];
        }

        if (preg_match('/^(\d+)/', $slug, $m)) {
            return (int) $m[1];
        }

        if (preg_match('/(\d+)-sub-indo/i', $slug, $m)) {
            return (int) $m[1];
        }

        if (preg_match('/(?:^|-)(\d+)(?:-|$)/', $slug, $m)) {
            return (int) $m[1];
        }

        return null;
    }

    private function parseTitle(string $raw, int $number): string
    {
        $title = preg_replace(
            '/\s*(Subtitle Indonesia|Sub Indo|Sub-Indo)\s*$/i',
            '',
            $raw
        );

        $title = trim($title);

        if (!$title) {
            if ($number > 100000) {
                return 'OVA ' . ($number - 100000);
            }

            return 'Episode ' . $number;
        }

        return $title;
    }

    private function proxyDesuStreamUrl(?string $url): ?string
    {
        if (!$url) {
            return $url;
        }

        $prefix = 'https://video.sumantritelnologi.workers.dev/';

        if (str_starts_with($url, $prefix)) {
            return $url;
        }

        if (
            str_starts_with($url, 'https://desustream.net/') ||
            str_starts_with($url, 'http://desustream.net/')
        ) {
            return $prefix . $url;
        }

        return $url;
    }

    private function parseMirrorStreams(array $streams): array
    {
        $result = [];

        foreach ($streams as $stream) {
            if (!is_array($stream)) {
                continue;
            }

            $url = $stream['stream_url'] ?? $stream['url'] ?? '';

            if (!$url) {
                continue;
            }

            $provider = $stream['provider'] ??
                parse_url($url, PHP_URL_HOST) ??
                'Unknown';

            $quality = $stream['quality'] ?? '';

            $result[] = [
                'label' => trim($provider . ' ' . $quality),
                'url' => $this->proxyDesuStreamUrl($url),
            ];
        }

        return $result;
    }

    private function parseDownloadUrls(array $downloads): array
    {
        $result = [];

        foreach ($downloads as $download) {
            if (!is_array($download)) {
                continue;
            }

            if (
                isset($download['urls']) &&
                is_array($download['urls'])
            ) {
                $resolution = $download['resolution'] ?? '';
                $size = $download['size'] ?? '';

                foreach ($download['urls'] as $u) {
                    if (!is_array($u)) {
                        continue;
                    }

                    $url = $u['url'] ?? '';

                    if (!$url) {
                        continue;
                    }

                    $provider = $u['provider'] ?? 'Unknown';

                    $result[] = [
                        'label' => trim(
                            $resolution .
                            ' - ' .
                            $provider .
                            ($size ? " ({$size})" : '')
                        ),
                        'url' => $url,
                    ];
                }

                continue;
            }

            if (!empty($download['url'])) {
                $result[] = [
                    'label' => $download['label'] ?? 'Download',
                    'url' => $download['url'],
                ];
            }
        }

        return $result;
    }
}
