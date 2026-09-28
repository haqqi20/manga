<?php

namespace App\Filament\Widgets;

use App\Models\Anime;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class RecentlyAdded extends BaseWidget
{
    protected static ?int $sort = 2;

    protected int | string | array $columnSpan = 'full';

    protected static ?string $heading = 'Recently Added';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Anime::query()->latest()
            )
            ->columns([
                Tables\Columns\ImageColumn::make('poster')
                    ->label('')
                    ->circular()
                    ->size(40),

                Tables\Columns\TextColumn::make('title')
                    ->label('Title')
                    ->description(fn (Anime $record): string => $record->slug)
                    ->limit(35),

                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Ongoing' => 'success',
                        'Completed' => 'info',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Added')
                    ->since()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->defaultPaginationPageOption(5)
            ->paginated([5, 10]);
    }
}
