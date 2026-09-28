<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use App\Models\Episode;
use App\Models\Manga;
use App\Models\Chapter;

class ReportController extends Controller
{
    /**
     * Store report for Anime Episode
     */
    public function store(Request $request, Episode $episode)
    {
        $request->validate([
            'type' => 'required|string|max:50',
            'message' => 'nullable|string|max:500',
        ]);

        Report::create([
            'user_id' => auth()->id(),
            'episode_id' => $episode->id,
            'type' => $request->type,
            'message' => $request->message,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Laporan Anda telah dikirim. Terima kasih!');
    }

    /**
     * Store report for Manga
     */
    public function manga(Request $request, Manga $manga)
    {
        $request->validate([
            'type' => 'required|string|max:50',
            'message' => 'nullable|string|max:500',
        ]);

        Report::create([
            'user_id' => auth()->id(),
            'manga_id' => $manga->id,
            'type' => $request->type,
            'message' => $request->message,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Laporan masalah seri telah dikirim. Terima kasih!');
    }

    /**
     * Store report for Manga Chapter
     */
    public function chapter(Request $request, Chapter $chapter)
    {
        $request->validate([
            'type' => 'required|string|max:50',
            'message' => 'nullable|string|max:500',
        ]);

        Report::create([
            'user_id' => auth()->id(),
            'manga_id' => $chapter->manga_id,
            'chapter_id' => $chapter->id,
            'type' => $request->type,
            'message' => $request->message,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Laporan masalah chapter telah dikirim. Terima kasih!');
    }
}
