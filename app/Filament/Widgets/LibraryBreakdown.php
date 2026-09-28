<?php

namespace App\Filament\Widgets;

use App\Models\Anime;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Cache;

class LibraryBreakdown extends ChartWidget
{
    protected static ?int $sort = 3;

    protected ?string $heading = 'Library Breakdown';

    protected ?string $maxHeight = '250px';

    protected function getData(): array
    {
        $data = Cache::remember('dashboard_library_breakdown', 60, function () {
            return [
                'ongoing' => Anime::where('status', 'Ongoing')->count(),
                'completed' => Anime::where('status', 'Completed')->count(),
                'other' => Anime::whereNotIn('status', ['Ongoing', 'Completed'])->count(),
            ];
        });

        return [
            'datasets' => [
                [
                    'label' => 'Anime by Status',
                    'data' => [$data['ongoing'], $data['completed'], $data['other']],
                    'backgroundColor' => [
                        'rgb(99, 102, 241)',
                        'rgb(168, 85, 247)',
                        'rgb(236, 72, 153)',
                    ],
                    'borderWidth' => 0,
                ],
            ],
            'labels' => ['Ongoing', 'Completed', 'Other'],
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'position' => 'bottom',
                ],
            ],
            'cutout' => '65%',
        ];
    }
}
