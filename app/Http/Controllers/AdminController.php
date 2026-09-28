<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Anime;
use App\Models\Character;
use App\Models\Staff;
use App\Models\Episode;
use App\Models\Genre;
use App\Models\Manga;
use App\Models\Chapter;
use App\Models\User;
use App\Models\Page;
use App\Models\Report;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use App\Models\LicenseSetting;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class AdminController extends Controller
{
    // ─── Dashboard ────────────────────────────────────────────────────────────
    public function dashboard()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'animes'         => Anime::count(),
                'mangas'         => Manga::count(),
                'episodes'       => Episode::count(),
                'chapters'       => Chapter::count(),
                'characters'     => Character::count(),
                'genres'         => Genre::count(),
                'users'          => User::count(),
                'featured_anime' => Anime::where('is_featured', true)->count(),
                'reports'        => Report::count(),
            ],
            'recentAnimes'   => Anime::with('genres')->latest()->take(8)->get(),
            'recentMangas'   => Manga::with('genres')->latest()->take(8)->get(),
            'recentEpisodes' => Episode::with('anime')->latest()->take(8)->get(),
        ]);
    }

    // ─── Anime ────────────────────────────────────────────────────────────────
    public function animeIndex(Request $request)
    {
        $query = Anime::with('genres');
        if ($request->search) {
            $query->where('title', 'like', '%'.$request->search.'%');
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->type) {
            $query->where('type', $request->type);
        }
        return Inertia::render('Admin/Anime/Index', [
            'animes'  => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }

    public function animeCreate()
    {
        return Inertia::render('Admin/Anime/Create', [
            'genres' => Genre::orderBy('name')->get(),
        ]);
    }

    public function animeStore(Request $request)
    {
        $data = $request->validate([
            'anilist_id'     => 'nullable|integer',
            'title'          => 'required|string|max:255',
            'synopsis'       => 'nullable|string',
            'status'         => 'required|in:ongoing,completed,upcoming',
            'type'           => 'required|in:TV,Movie,OVA,ONA,Special',
            'poster'         => 'nullable|string|max:500',
            'rating'         => 'nullable|numeric|min:0|max:10',
            'release_year'   => 'nullable|integer',
            'studio'         => 'nullable|string|max:255',
            'trailer_url'    => 'nullable|string|max:500',
            'is_featured'    => 'boolean',
            'genres'         => 'array',
            'genres.*'       => 'exists:genres,id',
        ]);

        $data['slug']            = Str::slug($data['title']);
        $data['episodes_count']  = 0;
        $data['is_featured']     = $data['is_featured'] ?? false;

        if ($data['is_featured']) {
            $featuredCount = Anime::where('is_featured', true)->count();
            if ($featuredCount >= 6) {
                return redirect()->back()->withInput()->with('error', 'Maksimal 6 anime yang bisa ditampilkan di slider. Silakan nonaktifkan anime lain terlebih dahulu.');
            }
        }

        $genres                  = $data['genres'] ?? [];
        unset($data['genres']);

        $anime = Anime::create($data);
        if ($genres) {
            $anime->genres()->sync($genres);
        }

        return redirect()->route('admin.anime.index')->with('success', 'Anime berhasil ditambahkan!');
    }

    public function animeEdit(Anime $anime)
    {
        return Inertia::render('Admin/Anime/Edit', [
            'anime'  => $anime->load(['genres', 'characters', 'staff', 'episodes' => fn($q) => $q->orderBy('number')]),
            'genres' => Genre::orderBy('name')->get(),
        ]);
    }

    public function animeUpdate(Request $request, Anime $anime)
    {
        $data = $request->validate([
            'anilist_id'     => 'nullable|integer',
            'title'          => 'required|string|max:255',
            'synopsis'       => 'nullable|string',
            'status'         => 'required|in:ongoing,completed,upcoming',
            'type'           => 'required|in:TV,Movie,OVA,ONA,Special',
            'poster'         => 'nullable|string|max:500',
            'rating'         => 'nullable|numeric|min:0|max:10',
            'release_year'   => 'nullable|integer',
            'studio'         => 'nullable|string|max:255',
            'trailer_url'    => 'nullable|string|max:500',
            'is_featured'    => 'boolean',
            'genres'         => 'array',
            'genres.*'       => 'exists:genres,id',
        ]);

        if ($anime->title !== $data['title']) {
            $data['slug'] = Str::slug($data['title']);
        }
        $genres = $data['genres'] ?? [];
        unset($data['genres']);

        if (($data['is_featured'] ?? false) && !$anime->is_featured) {
            $featuredCount = Anime::where('is_featured', true)->count();
            if ($featuredCount >= 6) {
                return redirect()->back()->withInput()->with('error', 'Maksimal 6 anime yang bisa ditampilkan di slider. Silakan nonaktifkan anime lain terlebih dahulu.');
            }
        }

        $anime->update($data);
        $anime->genres()->sync($genres);

        return redirect()->route('admin.anime.index')->with('success', 'Anime berhasil diperbarui!');
    }

    public function animeDestroy(Anime $anime)
    {
        $anime->delete();
        return back()->with('success', 'Anime berhasil dihapus!');
    }

    // ─── Characters ───────────────────────────────────────────────────────────
    public function characterIndex(Request $request)
    {
        $query = Character::with('anime');
        if ($request->search) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }
        if ($request->role) {
            $query->where('role', $request->role);
        }
        return Inertia::render('Admin/Characters/Index', [
            'characters' => $query->latest()->paginate(25)->withQueryString(),
            'filters'    => $request->only(['search', 'role']),
        ]);
    }

    public function characterStore(Request $request, Anime $anime)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'image_url'  => 'nullable|string|max:500',
            'role'       => 'nullable|in:Main,Supporting',
            'sort_order' => 'nullable|integer',
        ]);
        $data['anime_id']   = $anime->id;
        $data['sort_order'] = $data['sort_order'] ?? Character::where('anime_id', $anime->id)->max('sort_order') + 1;
        Character::create($data);
        return back()->with('success', 'Karakter berhasil ditambahkan!');
    }

    public function characterDestroy(Anime $anime, Character $character)
    {
        $character->delete();
        return back()->with('success', 'Karakter dihapus.');
    }

    public function characterUpdate(Request $request, Anime $anime, Character $character)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'image_url'   => 'nullable|string|max:500',
            'role'        => 'nullable|in:Main,Supporting',
            'anilist_id'  => 'nullable|integer',
            'gender'      => 'nullable|string|max:50',
            'age'         => 'nullable|string|max:50',
            'blood_type'  => 'nullable|string|max:10',
            'description' => 'nullable|string',
            'slug'        => 'nullable|string|max:255',
        ]);
        $character->update($data);
        return back()->with('success', 'Karakter berhasil diperbarui!');
    }

    // ─── Staff ────────────────────────────────────────────────────────────────
    public function staffStore(Request $request, Anime $anime)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'image_url'  => 'nullable|string|max:500',
            'position'   => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
        ]);
        $data['anime_id']   = $anime->id;
        $data['sort_order'] = $data['sort_order'] ?? Staff::where('anime_id', $anime->id)->max('sort_order') + 1;
        Staff::create($data);
        return back()->with('success', 'Staff berhasil ditambahkan!');
    }

    public function staffDestroy(Anime $anime, $staffId)
    {
        Staff::where('anime_id', $anime->id)->where('id', $staffId)->delete();
        return back()->with('success', 'Staff dihapus.');
    }

    // Bulk replace characters + staff from AniList
    public function syncCast(Request $request, Anime $anime)
    {
        $request->validate([
            'characters'                 => 'nullable|array',
            'characters.*.name'          => 'required|string|max:255',
            'characters.*.image_url'     => 'nullable|string|max:500',
            'characters.*.role'          => 'nullable|string|max:50',
            'characters.*.anilist_id'    => 'nullable|integer',
            'characters.*.description'   => 'nullable|string',
            'characters.*.gender'        => 'nullable|string|max:50',
            'characters.*.age'           => 'nullable|string|max:50',
            'characters.*.blood_type'    => 'nullable|string|max:10',
            'staff'                      => 'nullable|array',
            'staff.*.name'               => 'required|string|max:255',
            'staff.*.image_url'          => 'nullable|string|max:500',
            'staff.*.position'           => 'nullable|string|max:255',
        ]);

        if ($request->has('characters')) {
            Character::where('anime_id', $anime->id)->delete();
            foreach ($request->characters as $i => $c) {
                $name = $c['name'];
                Character::create([
                    'anime_id'    => $anime->id,
                    'anilist_id'  => $c['anilist_id'] ?? null,
                    'name'        => $name,
                    'slug'        => Str::slug($name) ?: Str::slug($name . '-' . ($i + 1)),
                    'image_url'   => $c['image_url'] ?? null,
                    'role'        => $c['role'] ?? 'Supporting',
                    'sort_order'  => $i,
                    'description' => $c['description'] ?? null,
                    'gender'      => $c['gender'] ?? null,
                    'age'         => $c['age'] ?? null,
                    'blood_type'  => $c['blood_type'] ?? null,
                ]);
            }
        }

        if ($request->has('staff')) {
            Staff::where('anime_id', $anime->id)->delete();
            foreach ($request->staff as $i => $s) {
                Staff::create([
                    'anime_id'   => $anime->id,
                    'name'       => $s['name'],
                    'image_url'  => $s['image_url'] ?? null,
                    'position'   => $s['position'] ?? null,
                    'sort_order' => $i,
                ]);
            }
        }

        return back()->with('success', 'Cast berhasil disinkronkan dari AniList!');
    }
    public function episodeIndex(Request $request)
    {
        $query = Episode::with('anime');
        if ($request->anime_id) {
            $query->where('anime_id', $request->anime_id);
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%'.$request->search.'%')
                  ->orWhereHas('anime', fn($a) => $a->where('title', 'like', '%'.$request->search.'%'));
            });
        }
        return Inertia::render('Admin/Episode/Index', [
            'episodes' => $query->orderByDesc('release_date')->paginate(15)->withQueryString(),
            'animes'   => Anime::orderBy('title')->get(['id', 'title']),
            'filters'  => $request->only(['search', 'anime_id']),
        ]);
    }

    public function episodeCreate()
    {
        return Inertia::render('Admin/Episode/Create', [
            'animes' => Anime::orderBy('title')->get(['id', 'title']),
        ]);
    }

    public function episodeStore(Request $request)
    {
        $data = $request->validate([
            'anime_id'       => 'required|exists:animes,id',
            'title'          => 'nullable|string|max:255',
            'number'         => 'required|integer|min:1',
            'video_url'      => 'nullable|string|max:1000',
            'duration'       => 'nullable|integer',
            'release_date'   => 'nullable|date',
            'mirror_streams' => 'nullable|array',
            'download_urls'  => 'nullable|array',
        ]);

        Episode::create($data);

        // Update episodes_count
        $count = Episode::where('anime_id', $data['anime_id'])->count();
        Anime::where('id', $data['anime_id'])->update(['episodes_count' => $count]);

        return redirect()->route('admin.episode.index')->with('success', 'Episode berhasil ditambahkan!');
    }

    public function episodeEdit(Episode $episode)
    {
        return Inertia::render('Admin/Episode/Edit', [
            'episode' => $episode->load('anime'),
            'animes'  => Anime::orderBy('title')->get(['id', 'title']),
        ]);
    }

    public function episodeUpdate(Request $request, Episode $episode)
    {
        $data = $request->validate([
            'anime_id'       => 'required|exists:animes,id',
            'title'          => 'nullable|string|max:255',
            'number'         => 'required|integer|min:1',
            'video_url'      => 'nullable|string|max:1000',
            'duration'       => 'nullable|integer',
            'release_date'   => 'nullable|date',
            'mirror_streams' => 'nullable|array',
            'download_urls'  => 'nullable|array',
        ]);

        $episode->update($data);

        return redirect()->route('admin.episode.index')->with('success', 'Episode berhasil diperbarui!');
    }

    public function episodeDestroy(Episode $episode)
    {
        $animeId = $episode->anime_id;
        $episode->delete();
        $count = Episode::where('anime_id', $animeId)->count();
        Anime::where('id', $animeId)->update(['episodes_count' => $count]);
        return back()->with('success', 'Episode berhasil dihapus!');
    }

    // ─── Inline Episode Management (from Anime Edit page) ─────────────────────
    public function animeEpisodeStore(Request $request, Anime $anime)
    {
        $data = $request->validate([
            'title'          => 'nullable|string|max:255',
            'number'         => 'required|integer|min:1',
            'video_url'      => 'nullable|string|max:1000',
            'duration'       => 'nullable|integer',
            'release_date'   => 'nullable|date',
            'mirror_streams' => 'nullable|array',
            'download_urls'  => 'nullable|array',
        ]);
        $data['anime_id'] = $anime->id;
        Episode::create($data);
        $count = Episode::where('anime_id', $anime->id)->count();
        $anime->update(['episodes_count' => $count]);
        return redirect()->route('admin.anime.edit', $anime)->with('success', 'Episode berhasil ditambahkan!');
    }

    public function animeEpisodeUpdate(Request $request, Anime $anime, Episode $episode)
    {
        $data = $request->validate([
            'title'          => 'nullable|string|max:255',
            'number'         => 'required|integer|min:1',
            'video_url'      => 'nullable|string|max:1000',
            'duration'       => 'nullable|integer',
            'release_date'   => 'nullable|date',
            'mirror_streams' => 'nullable|array',
            'download_urls'  => 'nullable|array',
        ]);
        $episode->update($data);
        return redirect()->route('admin.anime.edit', $anime)->with('success', 'Episode berhasil diperbarui!');
    }

    public function animeEpisodeDestroy(Anime $anime, Episode $episode)
    {
        $episode->delete();
        $count = Episode::where('anime_id', $anime->id)->count();
        $anime->update(['episodes_count' => $count]);
        return redirect()->route('admin.anime.edit', $anime)->with('success', 'Episode berhasil dihapus!');
    }

    // ─── Genre ────────────────────────────────────────────────────────────────
    public function genreIndex()
    {
        return Inertia::render('Admin/Genre/Index', [
            'genres' => Genre::withCount('animes')->orderBy('name')->get(),
        ]);
    }

    public function genreStore(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100|unique:genres,name',
            'icon' => 'nullable|string|max:100',
        ]);
        $data['slug'] = Str::slug($data['name']);
        Genre::create($data);
        return back()->with('success', 'Genre berhasil ditambahkan!');
    }

    public function genreUpdate(Request $request, Genre $genre)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('genres', 'name')->ignore($genre)],
            'icon' => 'nullable|string|max:100',
        ]);
        $data['slug'] = Str::slug($data['name']);
        $genre->update($data);
        return back()->with('success', 'Genre berhasil diperbarui!');
    }

    public function genreDestroy(Genre $genre)
    {
        $genre->delete();
        return back()->with('success', 'Genre berhasil dihapus!');
    }

    // ─── Users ────────────────────────────────────────────────────────────────
    public function userIndex(Request $request)
    {
        $query = User::query();
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                  ->orWhere('email', 'like', '%'.$request->search.'%');
            });
        }
        if ($request->has('badge') && $request->badge !== 'all') {
            if ($request->badge === 'null' || $request->badge === 'regular') {
                $query->whereNull('badge');
            } else {
                $query->where('badge', $request->badge);
            }
        }
        return Inertia::render('Admin/Users/Index', [
            'users'   => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'badge']),
        ]);
    }

    public function userImpersonate(User $user)
    {
        // Block impersonating yourself or another admin
        if ($user->id === auth()->id()) {
            return back()->withErrors(['message' => 'Tidak dapat impersonate akun sendiri.']);
        }
        if ($user->is_admin) {
            return back()->withErrors(['message' => 'Tidak dapat impersonate akun admin.']);
        }

        // Store the original admin's ID so we can restore later
        session(['impersonating_admin_id' => auth()->id()]);

        Auth::loginUsingId($user->id);

        return redirect()->route('dashboard');
    }

    public function stopImpersonate()
    {
        $adminId = session()->pull('impersonating_admin_id');

        if (!$adminId) {
            return redirect()->route('dashboard');
        }

        Auth::loginUsingId($adminId);

        return redirect()->route('admin.user.index');
    }

    public function userToggleAdmin(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['message' => 'Tidak dapat mengubah role diri sendiri.']);
        }
        $user->update(['is_admin' => !$user->is_admin]);
        return back()->with('success', 'Role user berhasil diperbarui!');
    }

    public function userDestroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['message' => 'Tidak dapat menghapus akun sendiri.']);
        }
        $user->delete();
        return back()->with('success', 'User berhasil dihapus!');
    }

    public function userUpdateBadge(Request $request, User $user)
    {
        $validated = $request->validate([
            'badge' => 'nullable|string|in:null,premium,vip,developer'
        ]);

        // "null" string from react select handles resetting badge
        $badge = $validated['badge'] === 'null' ? null : $validated['badge'];

        $user->update(['badge' => $badge]);
        return back()->with('success', 'Badge user berhasil diperbarui!');
    }
    // ─── Profile Settings ─────────────────────────────────────────────────────────

    public function updateProfile(\Illuminate\Http\Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ], [
            'name.required'      => 'Nama wajib diisi.',
            'password.min'       => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak sama dengan password baru.',
            'avatar.image'       => 'Avatar harus berupa gambar.',
            'avatar.max'         => 'Ukuran avatar maksimal 2 MB.',
        ]);

        $user->name = $request->name;

        if ($request->filled('password')) {
            $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar_url && !filter_var($user->avatar_url, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($user->avatar_url);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar_url = $path;
        }

        $user->save();

        return redirect()->back()->with('success', 'Profil berhasil diperbarui!');
    }

    // ─── Pages ────────────────────────────────────────────────────────────────────
    public function pageIndex(Request $request)
    {
        $query = Page::query();
        if ($request->search) {
            $query->where('title', 'like', '%'.$request->search.'%');
        }
        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        return Inertia::render('Admin/Pages/Index', [
            'pages'   => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function pageCreate()
    {
        return Inertia::render('Admin/Pages/Create');
    }

    /**
     * Slug halaman tidak boleh sama dengan URL bawaan situs (mis. /library, /explore),
     * karena halaman seperti itu tidak akan pernah tampil.
     */
    private function ensurePageSlugIsFree(string $slug): void
    {
        $reserved = collect(\Illuminate\Support\Facades\Route::getRoutes()->getRoutes())
            ->reject(fn ($route) => $route->isFallback)
            ->map(fn ($route) => explode('/', trim($route->uri(), '/'))[0])
            ->reject(fn ($segment) => $segment === '' || str_starts_with($segment, '{'))
            ->unique();

        if ($reserved->contains($slug)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'slug' => "Slug \"{$slug}\" sudah dipakai oleh halaman bawaan situs. Gunakan slug lain.",
            ]);
        }
    }

    public function pageStore(Request $request)
    {
        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'slug'             => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/', 'unique:pages,slug'],
            'content'          => 'nullable|string',
            'status'           => 'required|in:draft,published',
            'meta_title'       => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ], [
            'slug.regex' => 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-).',
        ]);
        if (empty($validated['slug'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']);
        }
        $this->ensurePageSlugIsFree($validated['slug']);
        Page::create($validated);
        return redirect()->route('admin.page.index')->with('success', 'Halaman berhasil dibuat!');
    }

    public function pageEdit(Page $page)
    {
        return Inertia::render('Admin/Pages/Edit', ['page' => $page]);
    }

    public function pageUpdate(Request $request, Page $page)
    {
        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'slug'             => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/', Rule::unique('pages', 'slug')->ignore($page->id)],
            'content'          => 'nullable|string',
            'status'           => 'required|in:draft,published',
            'meta_title'       => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ], [
            'slug.regex' => 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-).',
        ]);
        if (empty($validated['slug'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']);
        }
        $this->ensurePageSlugIsFree($validated['slug']);
        $page->update($validated);
        return redirect()->route('admin.page.index')->with('success', 'Halaman berhasil diperbarui!');
    }

    public function pageDestroy(Page $page)
    {
        $page->delete();
        return back()->with('success', 'Halaman berhasil dihapus!');
    }

    public function toggleFeatured(Anime $anime)
    {
        if (!$anime->is_featured) {
            $featuredCount = Anime::where('is_featured', true)->count();
            if ($featuredCount >= 6) {
                return response()->json(['error' => 'Maksimal 6 anime di slider.'], 422);
            }
        }

        $anime->update(['is_featured' => !$anime->is_featured]);
        \Illuminate\Support\Facades\Cache::forget('home_featured_v2');

        return response()->json([
            'success' => true,
            'is_featured' => $anime->is_featured,
            'message' => $anime->is_featured ? 'Anime ditambahkan ke slider.' : 'Anime dihapus dari slider.'
        ]);
    }

    // ─── Reports ──────────────────────────────────────────────────────────────
    public function reportIndex(Request $request)
    {
        $query = Report::with(['user', 'episode.anime', 'manga', 'chapter.manga']);

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            })->orWhereHas('episode.anime', function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%');
            })->orWhereHas('manga', function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%');
            });
        }

        return Inertia::render('Admin/Reports/Index', [
            'reports' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function reportUpdateStatus(Request $request, Report $report)
    {
        $request->validate([
            'status' => 'required|in:pending,resolved,ignored',
        ]);

        $report->update(['status' => $request->status]);

        return back()->with('success', 'Status laporan berhasil diperbarui!');
    }

    public function reportDestroy(Report $report)
    {
        $report->delete();
        return back()->with('success', 'Laporan berhasil dihapus!');
    }

    // ─── License Management ───────────────────────────────────────────────────
    public function licenseIndex()
    {
        $setting = LicenseSetting::getInstance();
        
        return Inertia::render('Admin/License/Index', [
            'license' => [
                'license_key'      => $setting->license_key ?? '',
                'domain'           => $setting->domain ?? request()->getHost(),
                'status'           => $setting->status ?? 'inactive',
                'product_name'     => $setting->product_name ?? 'Hestia',
                'activated_at'     => $setting->activated_at ? $setting->activated_at->format('d M Y H:i') : null,
                'last_verified_at' => $setting->last_verified_at ? $setting->last_verified_at->diffForHumans() : null,
                'has_license'      => $setting->status === 'active',
                'version'          => config('hestia.version', '1.0.4'),
            ]
        ]);
    }

    public function licenseActivate(Request $request)
    {
        $request->validate([
            'license_key' => 'required|string|min:10',
            'domain'      => 'required|string|min:3',
        ]);

        try {
            $response = Http::withoutVerifying()->timeout(15)
                ->withHeaders(['Accept' => 'application/json'])
                ->post(env('LICENSE_SERVER_URL', 'https://satulagistudio.com') . '/api/license/verify', [
                    'license_key' => trim($request->license_key),
                    'domain'      => trim($request->domain),
                    'product'     => 'hestia-streaming-anime-laravel-script',
                ]);

            if ($response->successful() && $response->json('valid') === true) {
                $data = $response->json();
                
                // Add a local integrity signature to the meta
                $data['integrity_check'] = hash_hmac('sha256', $request->license_key . $request->domain, 'hestia_secret_salt');

                LicenseSetting::updateOrCreate(['id' => 1], [
                    'license_key'      => trim($request->license_key),
                    'domain'           => trim($request->domain),
                    'product_name'     => $data['product_name'] ?? 'Hestia',
                    'status'           => 'active',
                    'activated_at'     => now(),
                    'last_verified_at' => now(),
                    'expires_at'       => isset($data['expires_at']) ? \Carbon\Carbon::parse($data['expires_at']) : null,
                    'meta'             => $data,
                ]);

                LicenseSetting::clearCache();
                return back()->with('success', 'Lisensi berhasil diaktifkan! Website Anda sekarang resmi.');
            } else {
                $message = $response->json('message') ?? 'License key tidak valid.';
                
                LicenseSetting::updateOrCreate(['id' => 1], [
                    'license_key'      => trim($request->license_key),
                    'status'           => 'invalid',
                    'last_verified_at' => now(),
                ]);

                LicenseSetting::clearCache();
                return back()->with('error', 'Aktivasi Gagal: ' . $message);
            }
        } catch (\Exception $e) {
            return back()->with('error', 'Tidak dapat terhubung ke server lisensi. ' . $e->getMessage());
        }
    }

    public function licenseDeactivate()
    {
        LicenseSetting::updateOrCreate(['id' => 1], [
            'status' => 'inactive',
        ]);

        LicenseSetting::clearCache();
        return back()->with('success', 'Lisensi dinonaktifkan.');
    }

    public function licenseReverify()
    {
        $setting = LicenseSetting::find(1);

        if (!$setting || empty($setting->license_key)) {
            return back()->with('error', 'Tidak ada license key untuk diverifikasi.');
        }

        try {
            $response = Http::withoutVerifying()->timeout(15)
                ->withHeaders(['Accept' => 'application/json'])
                ->post(env('LICENSE_SERVER_URL', 'https://satulagistudio.com') . '/api/license/verify', [
                    'license_key' => $setting->license_key,
                    'domain'      => $setting->domain,
                    'product'     => 'hestia-streaming-anime-laravel-script',
                ]);

            if ($response->successful() && $response->json('valid') === true) {
                $data = $response->json();
                $data['integrity_check'] = hash_hmac('sha256', $setting->license_key . $setting->domain, 'hestia_secret_salt');
                
                $setting->update([
                    'status'           => 'active',
                    'last_verified_at' => now(),
                    'meta'             => $data,
                ]);

                LicenseSetting::clearCache();
                return back()->with('success', 'Lisensi masih valid dan aktif.');
            } else {
                $setting->update([
                    'status'           => 'invalid',
                    'last_verified_at' => now(),
                ]);

                LicenseSetting::clearCache();
                return back()->with('error', 'Lisensi tidak valid lagi: ' . ($response->json('message') ?? 'Lisensi tidak ditemukan di server.'));
            }
        } catch (\Exception $e) {
            return back()->with('error', 'Tidak dapat terhubung ke server untuk verifikasi.');
        }
    }
}
