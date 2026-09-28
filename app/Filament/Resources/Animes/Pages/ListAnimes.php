<?php

namespace App\Filament\Resources\Animes\Pages;

use App\Filament\Resources\Animes\AnimeResource;
use Filament\Actions\CreateAction;
use Filament\Actions\Action;
use Filament\Resources\Pages\ListRecords;
use App\Services\OtakudesuService;
use Filament\Notifications\Notification;

class ListAnimes extends ListRecords
{
    protected static string $resource = AnimeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('syncOngoing')
                ->label('Sync Latest Anime')
                ->icon('heroicon-o-arrow-path')
                ->color('success')
                ->requiresConfirmation()
                ->action(function (OtakudesuService $service) {
                    $count = $service->syncLatestOngoing();
                    
                    if ($count !== false) {
                        Notification::make()
                            ->title("Synced {$count} anime successfully!")
                            ->success()
                            ->send();
                    } else {
                        Notification::make()
                            ->title('Sync failed. Check Laravel logs.')
                            ->danger()
                            ->send();
                    }
                }),
            CreateAction::make(),
        ];
    }
}
