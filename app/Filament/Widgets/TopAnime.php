<?php

namespace App\Filament\Widgets;

use App\Models\Anime;
use Filament\Widgets\Widget;

class TopAnime extends Widget
{
    protected static ?int $sort = 4;

    protected string $view = 'filament.widgets.top-anime';

    protected function getViewData(): array
    {
        $topAnime = Anime::whereNotNull('rating')
            ->where('rating', '>', 0)
            ->orderByDesc('rating')
            ->limit(5)
            ->get(['id', 'title', 'rating', 'slug']);

        return [
            'topAnime' => $topAnime,
        ];
    }
}
