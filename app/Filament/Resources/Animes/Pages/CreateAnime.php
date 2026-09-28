<?php

namespace App\Filament\Resources\Animes\Pages;

use App\Filament\Resources\Animes\AnimeResource;
use Filament\Resources\Pages\CreateRecord;

class CreateAnime extends CreateRecord
{
    protected static string $resource = AnimeResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        // Remove non-model fields
        unset($data['anilist_search'], $data['anilist_select'], $data['anilist_results'], $data['poster_file']);

        return $data;
    }
}
