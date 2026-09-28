<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AdController extends Controller
{
    private $adsPath = 'ads.json';

    public function index()
    {
        $ads = $this->getAds();
        return Inertia::render('Admin/Ads/Index', [
            'ads' => $ads
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'home_top' => 'nullable|string',
            'home_bottom' => 'nullable|string',
            'anime_detail_top' => 'nullable|string',
            'episode_detail_top' => 'nullable|string',
            'episode_detail_bottom' => 'nullable|string',
            'manga_detail_top' => 'nullable|string',
            'chapter_detail_top' => 'nullable|string',
            'chapter_detail_bottom' => 'nullable|string',
        ]);

        Storage::disk('public')->put($this->adsPath, json_encode($data, JSON_PRETTY_PRINT));

        // Clear cache
        try {
            \Illuminate\Support\Facades\Artisan::call('cache:clear');
            \Illuminate\Support\Facades\Artisan::call('view:clear');
        } catch (\Exception $e) { }

        return redirect()->back()->with('success', 'Pengaturan iklan berhasil disimpan.');
    }

    private function getAds()
    {
        if (Storage::disk('public')->exists($this->adsPath)) {
            return json_decode(Storage::disk('public')->get($this->adsPath), true) ?? [];
        }
        return [];
    }
}
