<?php

namespace App\Filament\Widgets;

use App\Models\Anime;
use App\Models\Episode;
use App\Models\Genre;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;

class StatsOverview extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $animeCount = Cache::remember('dashboard_anime_count', 60, fn () => Anime::count());
        $episodeCount = Cache::remember('dashboard_episode_count', 60, fn () => Episode::count());
        $userCount = Cache::remember('dashboard_user_count', 60, fn () => User::count());
        $genreCount = Cache::remember('dashboard_genre_count', 60, fn () => Genre::count());

        return [
            Stat::make('Total Anime', $animeCount)
                ->description('All anime in library')
                ->descriptionIcon('heroicon-m-film')
                ->color('primary')
                ->chart([7, 3, 4, 5, 6, 3, 5]),

            Stat::make('Total Episodes', $episodeCount)
                ->description('Across all anime')
                ->descriptionIcon('heroicon-m-play-circle')
                ->color('success')
                ->chart([3, 5, 7, 6, 3, 5, 4]),

            Stat::make('Active Users', $userCount)
                ->description('Registered users')
                ->descriptionIcon('heroicon-m-users')
                ->color('warning')
                ->chart([2, 3, 2, 3, 4, 3, 5]),

            Stat::make('Total Genres', $genreCount)
                ->description('Genre categories')
                ->descriptionIcon('heroicon-m-tag')
                ->color('info')
                ->chart([4, 3, 5, 4, 6, 5, 7]),
        ];
    }
}
