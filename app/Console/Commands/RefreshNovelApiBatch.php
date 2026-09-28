<?php

namespace App\Console\Commands;

use App\Models\Novel;
use App\Services\NovelApiRefreshService;
use Illuminate\Console\Command;

class RefreshNovelApiBatch extends Command
{
    protected $signature = 'novel:refresh-api-batch {--limit=30 : Jumlah novel per batch} {--chapters=1 : Ikut sync list chapter}';

    protected $description = 'Refresh metadata novel dari API secara bertahap agar aman untuk ribuan data.';

    public function handle(NovelApiRefreshService $refreshService): int
    {
        $limit = max(1, min(100, (int) $this->option('limit')));
        $withChapters = (bool) ((int) $this->option('chapters'));

        $novels = Novel::query()
            ->where('api_sync_status', 'pending')
            ->orderBy('api_sync_requested_at')
            ->limit($limit)
            ->get();

        if ($novels->isEmpty()) {
            $this->info('Tidak ada novel pending refresh.');
            return self::SUCCESS;
        }

        foreach ($novels as $novel) {
            try {
                $result = $refreshService->refresh($novel, $withChapters);
                $this->info("OK: {$novel->title} ({$result['chapters']} chapter)");
            } catch (\Throwable $e) {
                $this->error("FAILED: {$novel->title} - {$e->getMessage()}");
            }
        }

        return self::SUCCESS;
    }
}
