<?php

namespace App\Http\Controllers;

use App\Models\Anime;
use App\Models\Episode;
use App\Models\Manga;
use App\Models\Chapter;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class CommentController extends Controller
{
    public function store(Request $request, Anime $anime)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $anime->comments()->create([
            'user_id' => auth()->id(),
            'content' => $request->content,
            'parent_id' => $request->parent_id,
        ]);

        $this->clearAnimeCache($anime);

        return back()->with('success', 'Komentar berhasil ditambahkan.');
    }

    public function storeEpisode(Request $request, Episode $episode)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $episode->comments()->create([
            'user_id' => auth()->id(),
            'content' => $request->content,
            'parent_id' => $request->parent_id,
        ]);

        $this->clearEpisodeCache($episode);

        return back()->with('success', 'Komentar berhasil ditambahkan.');
    }

    public function storeManga(Request $request, Manga $manga)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $manga->comments()->create([
            'user_id' => auth()->id(),
            'content' => $request->content,
            'parent_id' => $request->parent_id,
        ]);

        $this->clearMangaCache($manga);

        return back()->with('success', 'Komentar berhasil ditambahkan.');
    }

    public function storeChapter(Request $request, Chapter $chapter)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $chapter->comments()->create([
            'user_id' => auth()->id(),
            'content' => $request->content,
            'parent_id' => $request->parent_id,
        ]);

        $this->clearChapterCache($chapter);

        return back()->with('success', 'Komentar berhasil ditambahkan.');
    }

    public function destroy(Comment $comment)
    {
        if (auth()->id() !== $comment->user_id && !auth()->user()->is_admin) {
            abort(403);
        }

        $episode = $comment->episode;
        $anime = $comment->anime;
        $manga = $comment->manga;
        $chapter = $comment->chapter;

        $comment->delete();

        if ($episode) {
            $this->clearEpisodeCache($episode);
        }

        if ($anime) {
            $this->clearAnimeCache($anime);
        }

        if ($manga) {
            $this->clearMangaCache($manga);
        }

        if ($chapter) {
            $this->clearChapterCache($chapter);
        }

        return back()->with('success', 'Komentar berhasil dihapus.');
    }

    private function clearAnimeCache(Anime $anime): void
    {
        Cache::forget('anime_show_slug_' . $anime->slug);
        Cache::forget('anime_show_slug_v2_' . $anime->slug);
    }

    private function clearEpisodeCache(Episode $episode): void
    {
        Cache::forget('episode_detail_' . $episode->anime_id . '_' . $episode->number);
        Cache::forget('episode_detail_v2_' . $episode->anime_id . '_' . $episode->number);

        if ($episode->relationLoaded('anime') || $episode->anime) {
            Cache::forget('episode_anime_' . $episode->anime->slug);
            Cache::forget('episode_anime_v2_' . $episode->anime->slug);
            $this->clearAnimeCache($episode->anime);
        }
    }

    private function clearMangaCache(Manga $manga): void
    {
        Cache::forget('manga_slug_' . $manga->slug);
        Cache::forget('manga_slug_v2_' . $manga->slug);
    }

    private function clearChapterCache(Chapter $chapter): void
    {
        Cache::forget('chapter_read_' . $chapter->manga_id . '_' . $chapter->slug);
        Cache::forget('chapter_read_v2_' . $chapter->manga_id . '_' . $chapter->slug);
        Cache::forget('chapter_read_' . $chapter->manga_id . '_' . $chapter->chapter_number);
        Cache::forget('chapter_read_v2_' . $chapter->manga_id . '_' . $chapter->chapter_number);

        if ($chapter->relationLoaded('manga') || $chapter->manga) {
            $this->clearMangaCache($chapter->manga);
        }
    }
}
