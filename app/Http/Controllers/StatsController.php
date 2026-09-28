<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class StatsController extends Controller
{
    /**
     * Record a visit and return current stats.
     */
    public function track(Request $request)
    {
        $ip  = $request->ip();
        $now = time();

        // --- Online visitors: keep IPs active in the last 5 minutes ---
        // Cap array at 10 000 entries to prevent memory-based DoS under heavy traffic
        $online      = Cache::get('stats_online', []);
        if (count($online) < 10000) {
            $online[$ip] = $now;
        }
        $online = array_filter($online, fn($t) => ($now - $t) < 300);
        Cache::put('stats_online', $online, 600);

        // --- Total unique visitors per day per IP ---
        $dailyKey = 'stats_seen_' . date('Y-m-d') . '_' . md5($ip);
        if (!Cache::has($dailyKey)) {
            Cache::put($dailyKey, 1, 86400);
            Cache::increment('stats_total_visitors');
        }

        return response()->json([
            'online' => count($online),
            'total'  => (int) Cache::get('stats_total_visitors', 1),
        ]);
    }

    /**
     * Return current stats without modifying them.
     */
    public function stats()
    {
        $now    = time();
        $online = Cache::get('stats_online', []);
        $online = array_filter($online, fn($t) => ($now - $t) < 300);

        return response()->json([
            'online' => count($online),
            'total'  => (int) Cache::get('stats_total_visitors', 0),
        ]);
    }
}
