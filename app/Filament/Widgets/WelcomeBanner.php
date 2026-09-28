<?php

namespace App\Filament\Widgets;

use App\Models\Anime;
use App\Models\Episode;
use Filament\Widgets\Widget;

class WelcomeBanner extends Widget
{
    protected static ?int $sort = 0;

    protected int | string | array $columnSpan = 'full';

    protected string $view = 'filament.widgets.welcome-banner';

    protected function getViewData(): array
    {
        $today = now()->format('l, d F Y');
        $animeToday = Anime::whereDate('created_at', today())->count();
        $episodesToday = Episode::whereDate('created_at', today())->count();

        return [
            'date' => $today,
            'userName' => auth()->user()->name ?? 'Admin',
            'animeToday' => $animeToday,
            'episodesToday' => $episodesToday,
        ];
    }
}
