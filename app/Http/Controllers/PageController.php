<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PageController extends Controller
{
    /**
     * Halaman statis dari admin (Admin → Pages), diakses lewat /{slug}.
     */
    public function show(string $slug)
    {
        // Hanya satu segmen URL, contoh: /terms, /privacy, /dmca, /contact
        abort_unless(preg_match('/^[a-z0-9-]+$/', $slug), 404);

        $page = Page::where('slug', $slug)->where('status', 'published')->firstOrFail();

        $description = $page->meta_description
            ?: Str::limit(trim(preg_replace('/\s+/', ' ', strip_tags($page->content))), 155);

        return Inertia::render('StaticPage', [
            'page' => [
                'title'      => $page->title,
                'slug'       => $page->slug,
                'content'    => $page->content,
                'updated_at' => $page->updated_at?->toIso8601String(),
            ],
            'og' => [
                'title'       => $page->meta_title ?: $page->title,
                'description' => $description,
                'url'         => url('/'.$page->slug),
                'type'        => 'article',
            ],
        ]);
    }
}
