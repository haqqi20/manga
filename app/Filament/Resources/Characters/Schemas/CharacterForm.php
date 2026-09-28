<?php

namespace App\Filament\Resources\Characters\Schemas;

use Filament\Forms\Components\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Notifications\Notification;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class CharacterForm
{
    // ─── AniList single-character fetch ──────────────────────────────────────

    private static function fetchCharacterFromAnilist(int $anilistId): ?array
    {
        $query = <<<'GQL'
        query ($id: Int) {
            Character(id: $id) {
                id
                name { full native }
                image { large }
                description(asHtml: false)
                gender
                age
                bloodType
            }
        }
        GQL;

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept'       => 'application/json',
            ])->post('https://graphql.anilist.co', [
                'query'     => $query,
                'variables' => ['id' => $anilistId],
            ]);

            if (!$response->successful()) return null;

            $char = $response->json('data.Character');
            if (!$char) return null;

            // Clean description: strip spoiler tags and HTML
            $desc = $char['description'] ?? null;
            if ($desc) {
                $desc = preg_replace('/~!.*?!~/s', '', $desc); // remove spoilers
                $desc = strip_tags($desc);
                $desc = trim($desc);
            }

            return [
                'anilist_id'  => $char['id'],
                'name'        => $char['name']['full'] ?? null,
                'image_url'   => $char['image']['large'] ?? null,
                'description' => $desc,
                'gender'      => $char['gender'] ?? null,
                'age'         => $char['age'] ?? null,
                'blood_type'  => $char['bloodType'] ?? null,
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    // ─── Form schema ─────────────────────────────────────────────────────────

    public static function configure(Schema $schema): Schema
    {
        return $schema->components([

            // ── AniList Sync ─────────────────────────────────────────────────
            Section::make('Sync from AniList')
                ->description('Enter the AniList Character ID below and click "Fetch" to auto-fill character details.')
                ->schema([
                    TextInput::make('anilist_id')
                        ->label('AniList Character ID')
                        ->numeric()
                        ->default(null)
                        ->placeholder('e.g. 176754')
                        ->hintAction(
                            Action::make('fetchFromAnilist')
                                ->label('Fetch from AniList')
                                ->icon('heroicon-o-arrow-down-tray')
                                ->color('info')
                                ->requiresConfirmation()
                                ->modalHeading('Fetch from AniList')
                                ->modalDescription('This will overwrite name, image, gender, age, blood type and description with data from AniList. Continue?')
                                ->action(function (Get $get, Set $set) {
                                    $anilistId = (int) $get('anilist_id');
                                    if (!$anilistId) {
                                        Notification::make()
                                            ->warning()
                                            ->title('Please enter an AniList Character ID first')
                                            ->send();
                                        return;
                                    }

                                    $data = static::fetchCharacterFromAnilist($anilistId);
                                    if (!$data) {
                                        Notification::make()
                                            ->danger()
                                            ->title('Failed to fetch character data from AniList')
                                            ->body("Character ID {$anilistId} not found or AniList API error.")
                                            ->send();
                                        return;
                                    }

                                    if ($data['name'])        $set('name',        $data['name']);
                                    if ($data['image_url'])   $set('image_url',   $data['image_url']);
                                    if ($data['gender'])      $set('gender',      $data['gender']);
                                    if ($data['age'])         $set('age',         $data['age']);
                                    if ($data['blood_type'])  $set('blood_type',  $data['blood_type']);
                                    if ($data['description']) $set('description', $data['description']);

                                    // Auto-generate slug from name
                                    if ($data['name']) $set('slug', Str::slug($data['name']));

                                    Notification::make()
                                        ->success()
                                        ->title('Fetched: ' . $data['name'])
                                        ->body(implode(' · ', array_filter([
                                            $data['gender'] ? 'Gender: ' . $data['gender'] : null,
                                            $data['age']    ? 'Age: '    . $data['age']    : null,
                                        ])))
                                        ->send();
                                }),
                        ),
                ])
                ->columns(1)
                ->collapsible()
                ->columnSpanFull(),

            // ── Character Info ────────────────────────────────────────────────
            Section::make('Character Info')
                ->schema([
                    TextInput::make('name')
                        ->required(),
                    TextInput::make('slug')
                        ->label('Slug')
                        ->placeholder('auto-generated from name'),
                    TextInput::make('image_url')
                        ->label('Image URL')
                        ->url()
                        ->placeholder('https://s4.anilist.co/file/...')
                        ->columnSpanFull(),
                    Select::make('role')
                        ->options([
                            'Main' => 'Main',
                            'Supporting' => 'Supporting',
                        ])
                        ->default('Main'),
                    Select::make('anime_id')
                        ->label('Anime')
                        ->relationship('anime', 'title')
                        ->searchable()
                        ->preload()
                        ->required(),
                    TextInput::make('gender')->default(null),
                    TextInput::make('age')->default(null),
                    TextInput::make('blood_type')->label('Blood Type')->default(null),
                    TextInput::make('sort_order')->numeric()->default(0),
                    Textarea::make('description')
                        ->rows(5)
                        ->default(null)
                        ->columnSpanFull(),
                ])
                ->columns(2),
        ]);
    }
}
