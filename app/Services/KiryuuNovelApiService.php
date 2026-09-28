<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Carbon\Carbon;

class KiryuuNovelApiService
{
    public function settings(): array
    {
        $defaults = [
            'novel_source_domain' => 'https://novel.kiryuuid.net',
            'novel_api_url' => 'https://novel.kiryuuid.net/wp-json/kiryuu/v1',
            'novel_chapter_mode' => 'live_api',
            'novel_cover_hotlink' => true,
        ];

        try {
            if (Storage::disk('public')->exists('settings.json')) {
                $json = json_decode(Storage::disk('public')->get('settings.json'), true);
                if (is_array($json)) {
                    return array_merge($defaults, $json);
                }
            }
        } catch (\Throwable $e) {
            // keep defaults when storage/settings.json cannot be read
        }

        return $defaults;
    }

    public function sourceDomain(): string
    {
        $settings = $this->settings();
        return rtrim($settings['novel_source_domain'] ?: 'https://novel.kiryuuid.net', '/');
    }

    public function defaultBaseUrl(): string
    {
        $settings = $this->settings();
        $configured = $settings['novel_api_url']
            ?? config('services.kiryuu_novel_api.base_url')
            ?? env('KIRYUU_NOVEL_API_BASE')
            ?? '';

        if ($configured) {
            return rtrim($configured, '/');
        }

        return $this->sourceDomain() . '/wp-json/kiryuu/v1';
    }

    public function baseFromSource(?string $sourceUrl = null, ?string $baseUrl = null): string
    {
        if ($baseUrl) {
            return rtrim($baseUrl, '/');
        }

        // Utamakan global Novel API URL dari admin settings agar ganti domain cukup dari dashboard.
        $globalBase = $this->defaultBaseUrl();
        if ($globalBase) {
            return rtrim($globalBase, '/');
        }

        if ($sourceUrl) {
            $host = parse_url($sourceUrl, PHP_URL_HOST);
            $scheme = parse_url($sourceUrl, PHP_URL_SCHEME) ?: 'https';
            if ($host) {
                return $scheme . '://' . $host . '/wp-json/kiryuu/v1';
            }
        }

        return 'https://novel.kiryuuid.net/wp-json/kiryuu/v1';
    }

    public function sourceUrlFromSlug(string $slug): string
    {
        return $this->sourceDomain() . '/novelmanga/' . trim($slug, '/') . '/';
    }

    public function slugFromUrlOrSlug(string $value): string
    {
        $value = trim($value);
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            $path = trim(parse_url($value, PHP_URL_PATH) ?? '', '/');
            $parts = array_values(array_filter(explode('/', $path)));
            $idx = array_search('novelmanga', $parts, true);
            if ($idx !== false && isset($parts[$idx + 1])) {
                return $parts[$idx + 1];
            }
            return end($parts) ?: '';
        }
        return trim($value, '/');
    }

    protected function getJson(string $url): array
    {
        $res = Http::withoutVerifying()
            ->timeout(45)
            ->retry(2, 600)
            ->acceptJson()
            ->withHeaders([
                'User-Agent' => 'KiryuuLaravelNovelImporter/1.0',
            ])
            ->get($url);

        if (!$res->ok()) {
            throw new RuntimeException('API gagal diakses. HTTP ' . $res->status());
        }

        $json = $res->json();
        if (!is_array($json)) {
            throw new RuntimeException('Response API bukan JSON valid.');
        }
        return $json;
    }

    public function detail(string $sourceUrlOrSlug, ?string $baseUrl = null): array
    {
        $slug = $this->slugFromUrlOrSlug($sourceUrlOrSlug);
        if (!$slug) {
            throw new RuntimeException('Slug novel tidak valid.');
        }
        $base = $this->baseFromSource(filter_var($sourceUrlOrSlug, FILTER_VALIDATE_URL) ? $sourceUrlOrSlug : null, $baseUrl);
        $data = $this->getJson($base . '/novel/' . rawurlencode($slug));
        $data['slug'] = $data['slug'] ?? $slug;
        $data['api_base_url'] = $base;
        $data['source_url'] = $data['source_url'] ?? $data['url'] ?? (filter_var($sourceUrlOrSlug, FILTER_VALIDATE_URL) ? $sourceUrlOrSlug : $this->sourceUrlFromSlug($slug));

        // API plugin can return HTML synopsis. Keep paragraph tags so the public page
        // can render synopsis with its original paragraphs. Also normalize fields that
        // may come as array from WP taxonomies.
        $data['synopsis'] = $this->normalizeSynopsis($data['synopsis'] ?? $data['description'] ?? '');
        $data['genres'] = $this->normalizeTerms($data['genres'] ?? []);
        $data['tags'] = $this->normalizeTerms($data['tags'] ?? []);
        $data['type'] = $this->detectOriginFromTerms($data['tags'], $data['genres'], $data['type'] ?? null);
        $data['author'] = $data['author'] ?? $this->namesToString($data['authors'] ?? []);
        $data['artist'] = $data['artist'] ?? $this->namesToString($data['artists'] ?? []);
        $data['rating'] = $this->nullableFloat($data['rating'] ?? null);
        $data['release_year'] = $this->normalizeYear($data['release_year'] ?? $data['release'] ?? null);

        if (!empty($data['first_chapter']) && is_array($data['first_chapter'])) {
            $data['first_chapter']['slug'] = $data['first_chapter']['slug']
                ?? (!empty($data['first_chapter']['url']) ? basename(rtrim($data['first_chapter']['url'], '/')) : null);
        }

        return $data;
    }

    public function chapters(string $slug, ?string $baseUrl = null): array
    {
        $base = rtrim($baseUrl ?: $this->defaultBaseUrl(), '/');
        $data = $this->getJson($base . '/novel/' . rawurlencode($slug) . '/chapters');
        if (isset($data['chapters']) && is_array($data['chapters'])) {
            return $data['chapters'];
        }
        return is_array($data) ? $data : [];
    }

    public function chapter(string $novelSlug, string $chapterSlug, ?string $baseUrl = null): array
    {
        $base = rtrim($baseUrl ?: $this->defaultBaseUrl(), '/');
        return $this->getJson($base . '/chapter/' . rawurlencode($novelSlug) . '/' . rawurlencode($chapterSlug));
    }

    public function chapterNumberFromSlug(?string $slug, int $fallback = 0): float
    {
        $slug = (string) $slug;
        if (preg_match('/(?:chapter|ch|bab|episode|ep)[^0-9]*([0-9]+(?:[\.-][0-9]+)?)/i', $slug, $m)) {
            return (float) str_replace('-', '.', $m[1]);
        }
        if (preg_match('/([0-9]+(?:[\.-][0-9]+)?)/', $slug, $m)) {
            return (float) str_replace('-', '.', $m[1]);
        }
        return (float) $fallback;
    }

    public function normalizeChapter(array $chapter, int $index = 0): array
    {
        $url = $chapter['url'] ?? $chapter['source_url'] ?? null;
        $slug = $chapter['slug'] ?? null;
        if (!$slug && $url) {
            $slug = basename(rtrim($url, '/'));
        }

        $rawTitle = $chapter['title'] ?? $chapter['name'] ?? $chapter['label'] ?? null;
        $title = $rawTitle ? trim(html_entity_decode(strip_tags((string) $rawTitle), ENT_QUOTES | ENT_HTML5, 'UTF-8')) : null;
        $slug = $slug ?: Str::slug($title ?: ('chapter-' . ($index + 1)));

        // Untuk Novel jangan pakai logic penomoran Manga untuk menentukan urutan/judul.
        // Urutan harus mengikuti list bawaan API/Madara lewat kolom position.
        return [
            'title' => $title ?: $slug,
            'slug' => $slug,
            'chapter_number' => isset($chapter['chapter_number']) ? (float) $chapter['chapter_number'] : ($index + 1),
            'position' => isset($chapter['position']) ? (int) $chapter['position'] : ($index + 1),
            'source_url' => $url,
            'content' => $chapter['content'] ?? null,
        ];
    }

    public function normalizeSynopsis($value): string
    {
        if (is_array($value)) {
            $value = implode("\n\n", array_filter(array_map('strval', $value)));
        }
        $value = html_entity_decode((string) $value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $value = preg_replace('~<script\b[^>]*>.*?</script>~is', '', $value);
        $value = preg_replace('~<style\b[^>]*>.*?</style>~is', '', $value);
        $value = preg_replace('~<br\s*/?>\s*<br\s*/?>~i', '</p><p>', $value);

        // If API sends plain text with line breaks, convert to paragraphs.
        if ($value && strip_tags($value) === $value && str_contains($value, "\n")) {
            $parts = preg_split("~\n{2,}~", trim($value));
            $value = collect($parts)->map(fn($p) => '<p>' . e(trim($p)) . '</p>')->implode('');
        }

        $allowed = '<p><br><b><strong><i><em><u><ul><ol><li><span>';
        $value = strip_tags($value, $allowed);
        $value = preg_replace('~[ \t]+~u', ' ', $value);
        return trim($value);
    }


    public function normalizeTerms($items): array
    {
        if (is_string($items)) {
            $items = array_filter(array_map('trim', explode(',', $items)));
        }
        if (!is_array($items)) {
            return [];
        }

        $out = [];
        foreach ($items as $item) {
            if (is_array($item)) {
                $name = $item['name'] ?? $item['title'] ?? $item['label'] ?? $item['slug'] ?? null;
                $slug = $item['slug'] ?? null;
            } else {
                $name = $item;
                $slug = null;
            }

            $name = trim((string) $name);
            if ($name === '') {
                continue;
            }

            $slug = trim((string) ($slug ?: Str::slug($name)));
            $key = $slug ?: Str::slug($name);
            $out[$key] = [
                'name' => $name,
                'slug' => $key,
            ];
        }

        return array_values($out);
    }

    public function detectOriginFromTerms($tags = [], $genres = [], ?string $fallback = null): string
    {
        $terms = array_merge($this->normalizeTerms($tags), $this->normalizeTerms($genres));
        $text = strtolower(implode(' ', array_map(function ($term) {
            return trim(($term['name'] ?? '') . ' ' . ($term['slug'] ?? ''));
        }, $terms)) . ' ' . (string) $fallback);

        if (preg_match('/\b(jepang|japan|japanese|jp|novel-jepang|light-novel|ln)\b/i', $text)) {
            return 'Jepang';
        }
        if (preg_match('/\b(korea|korean|kr|manhwa|novel-korea)\b/i', $text)) {
            return 'Korean';
        }
        if (preg_match('/\b(china|chinese|cn|manhua|novel-china)\b/i', $text)) {
            return 'Chinese';
        }

        $fallback = trim((string) $fallback);
        return $fallback !== '' ? $fallback : 'Jepang';
    }

    public function namesToString($items): ?string
    {
        if (is_string($items)) return trim($items) ?: null;
        if (!is_array($items)) return null;
        $names = [];
        foreach ($items as $item) {
            if (is_array($item)) $item = $item['name'] ?? $item['title'] ?? $item['label'] ?? null;
            if ($item) $names[] = trim((string) $item);
        }
        $names = array_values(array_unique(array_filter($names)));
        return $names ? implode(', ', $names) : null;
    }

    public function nullableFloat($value): ?float
    {
        if ($value === null || $value === '') return null;
        if (is_string($value) && preg_match('/([0-9]+(?:\.[0-9]+)?)/', $value, $m)) return (float) $m[1];
        return is_numeric($value) ? (float) $value : null;
    }

    public function normalizeYear($value): ?int
    {
        if ($value === null || $value === '') return null;
        if (is_numeric($value)) return (int) $value;
        if (preg_match('/(19|20)\d{2}/', (string) $value, $m)) return (int) $m[0];
        return null;
    }
}
