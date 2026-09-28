<?php

namespace App\Filament\Resources\Animes\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Actions\Action;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Notifications\Notification;
use Filament\Schemas\Schema;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AnimeForm
{
    private const ANILIST_API = 'https://graphql.anilist.co';

    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Import from AniList')
                    ->description('Search and auto-fill anime data from AniList.co')
                    ->schema([
                        TextInput::make('anilist_search')
                            ->label('Search AniList')
                            ->placeholder('Type anime title to search...')
                            ->suffixAction(
                                Action::make('searchAnilist')
                                    ->icon('heroicon-m-magnifying-glass')
                                    ->action(function (Get $get, Set $set) {
                                        $search = $get('anilist_search');
                                        if (empty($search) || strlen($search) < 2) {
                                            Notification::make()
                                                ->warning()
                                                ->title('Please enter at least 2 characters')
                                                ->send();
                                            return;
                                        }

                                        $query = '
                                            query ($search: String) {
                                                Page(page: 1, perPage: 10) {
                                                    media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
                                                        id
                                                        title { romaji english }
                                                        coverImage { large }
                                                        format
                                                        seasonYear
                                                        averageScore
                                                        status
                                                    }
                                                }
                                            }
                                        ';

                                        $response = Http::withoutVerifying()->post(self::ANILIST_API, [
                                            'query' => $query,
                                            'variables' => ['search' => $search],
                                        ]);

                                        if ($response->failed()) {
                                            Notification::make()
                                                ->danger()
                                                ->title('AniList API request failed')
                                                ->send();
                                            return;
                                        }

                                        $results = $response->json('data.Page.media') ?? [];

                                        if (empty($results)) {
                                            Notification::make()
                                                ->warning()
                                                ->title('No results found')
                                                ->send();
                                            return;
                                        }

                                        // Build options for the select field
                                        $options = [];
                                        foreach ($results as $item) {
                                            $title = $item['title']['romaji'] ?? $item['title']['english'] ?? 'Unknown';
                                            $year = $item['seasonYear'] ?? '?';
                                            $format = $item['format'] ?? '?';
                                            $score = $item['averageScore'] ? round($item['averageScore'] / 10, 1) : '?';
                                            $options[$item['id']] = "{$title} ({$year}) [{$format}] ★{$score}";
                                        }

                                        $set('anilist_results', $options);

                                        Notification::make()
                                            ->success()
                                            ->title("Found " . count($results) . " results")
                                            ->send();
                                    })
                            )
                            ->dehydrated(false),
                        Select::make('anilist_select')
                            ->label('Select Anime')
                            ->options(fn (Get $get) => $get('anilist_results') ?? [])
                            ->placeholder('Search first, then select an anime...')
                            ->searchable()
                            ->reactive()
                            ->dehydrated(false),
                        TextInput::make('anilist_results')
                            ->hidden()
                            ->dehydrated(false),
                        Actions::make([
                            Action::make('importFromAnilist')
                                ->label('Import Data')
                                ->icon('heroicon-m-arrow-down-tray')
                                ->color('success')
                                ->requiresConfirmation()
                                ->modalHeading('Import from AniList')
                                ->modalDescription('This will overwrite all current form data with data from AniList. Continue?')
                                ->action(function (Get $get, Set $set) {
                                    $anilistId = $get('anilist_select');
                                    if (empty($anilistId)) {
                                        Notification::make()
                                            ->warning()
                                            ->title('Please select an anime first')
                                            ->send();
                                        return;
                                    }

                                    $data = static::fetchFromAnilist((int) $anilistId);
                                    if (!$data) {
                                        Notification::make()
                                            ->danger()
                                            ->title('Failed to fetch anime data')
                                            ->send();
                                        return;
                                    }

                                    // Fill main fields
                                    $set('title', $data['title']);
                                    $set('slug', $data['slug']);
                                    $set('synopsis', $data['synopsis']);
                                    $set('type', $data['type']);
                                    $set('status', $data['status']);
                                    $set('rating', $data['rating']);
                                    $set('release_year', $data['release_year']);
                                    $set('studio', $data['studio']);
                                    $set('trailer_url', $data['trailer_url']);
                                    $set('poster', $data['poster_url']);
                                    $set('episodes_count', $data['episodes_count'] ?? null);

                                    // Fill characters repeater
                                    $set('characters', $data['characters']);

                                    // Fill staff repeater
                                    $set('staff', $data['staff']);

                                    // Fill genres - create if not exist and set IDs
                                    $genreIds = [];
                                    foreach ($data['genres'] as $genreName) {
                                        $genre = \App\Models\Genre::firstOrCreate(
                                            ['name' => $genreName],
                                            ['slug' => \Illuminate\Support\Str::slug($genreName)]
                                        );
                                        $genreIds[] = $genre->id;
                                    }
                                    $set('genres', $genreIds);

                                    Notification::make()
                                        ->success()
                                        ->title('Imported: ' . $data['title'])
                                        ->body('Characters: ' . count($data['characters']) . ', Staff: ' . count($data['staff']) . ', Genres: ' . implode(', ', $data['genres']))
                                        ->send();
                                }),
                        ]),
                    ])
                    ->collapsible()
                    ->collapsed(false)
                    ->columnSpanFull(),

                Section::make('Anime Details')
                    ->schema([
                        TextInput::make('title')
                            ->required(),
                        TextInput::make('slug')
                            ->required(),
                        Textarea::make('synopsis')
                            ->default(null)
                            ->columnSpanFull(),
                        TextInput::make('status')
                            ->required()
                            ->default('Ongoing'),
                        Select::make('type')
                            ->options([
                                'TV' => 'TV',
                                'Movie' => 'Movie',
                                'OVA' => 'OVA',
                                'ONA' => 'ONA',
                                'Special' => 'Special',
                                'Music' => 'Music',
                                'Manga' => 'Manga',
                                'Manhwa' => 'Manhwa',
                                'Manhua' => 'Manhua',
                            ])
                            ->required()
                            ->default('TV'),
                        TextInput::make('poster')
                            ->label('Poster URL')
                            ->url()
                            ->placeholder('https://s4.anilist.co/file/...')
                            ->helperText('Paste an image URL or use the file upload below. URL takes priority.')
                            ->columnSpanFull(),
                        FileUpload::make('poster_file')
                            ->label('Or Upload Poster')
                            ->image()
                            ->directory('posters')
                            ->disk('public')
                            ->default(null)
                            ->dehydrated(false),
                        TextInput::make('trailer_url')
                            ->url()
                            ->placeholder('https://www.youtube.com/watch?v=...')
                            ->default(null),
                        TextInput::make('episodes_count')
                            ->label('Total Episodes')
                            ->numeric()
                            ->default(null)
                            ->placeholder('e.g. 12'),
                        TextInput::make('rating')
                            ->numeric()
                            ->default(null),
                        TextInput::make('release_year')
                            ->numeric()
                            ->default(null),
                        TextInput::make('studio')
                            ->default(null),
                        Select::make('genres')
                            ->relationship('genres', 'name')
                            ->multiple()
                            ->preload()
                            ->searchable()
                            ->createOptionForm([
                                TextInput::make('name')->required(),
                                TextInput::make('slug')->required(),
                            ])
                            ->columnSpanFull(),
                        Toggle::make('is_featured')
                            ->label('Featured in Hero Slider')
                            ->default(false),
                    ])
                    ->columns(2),

                Section::make('Characters')
                    ->schema([
                        Repeater::make('characters')
                            ->relationship()
                            ->schema([
                                TextInput::make('name')
                                    ->required(),
                                TextInput::make('slug')
                                    ->label('Slug (auto)')
                                    ->placeholder('auto-generated')
                                    ->dehydrated(true),
                                TextInput::make('anilist_id')
                                    ->label('AniList Character ID')
                                    ->numeric()
                                    ->default(null),
                                TextInput::make('image_url')
                                    ->label('Image URL')
                                    ->url()
                                    ->placeholder('https://s4.anilist.co/file/...'),
                                Select::make('role')
                                    ->options([
                                        'Main' => 'Main',
                                        'Supporting' => 'Supporting',
                                    ])
                                    ->default('Main'),
                                TextInput::make('gender')->default(null),
                                TextInput::make('age')->default(null),
                                TextInput::make('blood_type')->label('Blood Type')->default(null),
                                TextInput::make('sort_order')
                                    ->numeric()
                                    ->default(0),
                                \Filament\Forms\Components\Textarea::make('description')
                                    ->rows(3)
                                    ->default(null)
                                    ->columnSpanFull(),
                            ])
                            ->columns(2)
                            ->columnSpanFull()
                            ->defaultItems(0)
                            ->addActionLabel('Add Character')
                            ->collapsible()
                            ->cloneable(),
                    ])
                    ->collapsible()
                    ->columnSpanFull(),

                Section::make('Import Episodes from OtakuDesu')
                    ->description('Search OtakuDesu to automatically generate episodes and video links. Note: Generating many episodes may take 10-20 seconds.')
                    ->schema([
                        TextInput::make('otakudesu_search')
                            ->label('Search OtakuDesu')
                            ->placeholder('Type anime title to search...')
                            ->suffixAction(
                                Action::make('searchOtakudesu')
                                    ->icon('heroicon-m-magnifying-glass')
                                    ->action(function (Get $get, Set $set) {
                                        $search = $get('otakudesu_search');
                                        if (empty($search) || strlen($search) < 2) {
                                            Notification::make()
                                                ->warning()
                                                ->title('Please enter at least 2 characters')
                                                ->send();
                                            return;
                                        }

                                        $response = Http::withoutVerifying()
                                            ->timeout(30)
                                            ->get('https://api.satulagi.my.id/api/anime/search?q=' . urlencode($search));

                                        if ($response->failed() || !is_array($response->json())) {
                                            Notification::make()
                                                ->danger()
                                                ->title('Satulagi API request failed')
                                                ->send();
                                            return;
                                        }

                                        $results = $response->json() ?? [];

                                        if (empty($results)) {
                                            Notification::make()
                                                ->warning()
                                                ->title('No results found')
                                                ->send();
                                            return;
                                        }

                                        $options = [];
                                        foreach ($results as $item) {
                                            $options[$item['slug']] = "{$item['title']} - {$item['status']}";
                                        }

                                        $set('otakudesu_results', $options);

                                        Notification::make()
                                            ->success()
                                            ->title("Found " . count($results) . " results")
                                            ->send();
                                    })
                            )
                            ->dehydrated(false),
                        Select::make('otakudesu_select')
                            ->label('Select Anime')
                            ->options(fn (Get $get) => $get('otakudesu_results') ?? [])
                            ->placeholder('Search first, then select an anime...')
                            ->searchable()
                            ->reactive()
                            ->dehydrated(false),
                        TextInput::make('otakudesu_results')
                            ->hidden()
                            ->dehydrated(false),
                        Actions::make([
                            Action::make('generateOtakudesuEpisodes')
                                ->label('Generate Episodes (Satulagi API)')
                                ->icon('heroicon-m-arrow-down-tray')
                                ->color('success')
                                ->requiresConfirmation()
                                ->modalHeading('Generate Episodes')
                                ->modalDescription('This will fetch all episodes using the Satulagi API. Existing episode data WILL BE OVERWRITTEN. Continue?')
                                ->action(function (Get $get, Set $set) {
                                    $slug = $get('otakudesu_select');
                                    if (empty($slug)) {
                                        Notification::make()->warning()->title('Please select an anime first')->send();
                                        return;
                                    }

                                    Notification::make()->info()->title('Fetching episodes from Satulagi... This may take a while.')->send();

                                    // 1. Get Anime Details to get the list of episodes
                                    $animeResponse = Http::withoutVerifying()->timeout(30)->get("https://api.satulagi.my.id/api/anime/{$slug}");

                                    if ($animeResponse->failed() || empty($animeResponse->json('title'))) {
                                        Notification::make()->danger()->title('Failed to fetch anime details')->send();
                                        return;
                                    }

                                    $episodeList = $animeResponse->json('episode_list') ?? [];
                                    if (empty($episodeList)) {
                                        Notification::make()->warning()->title('No episodes found for this anime')->send();
                                        return;
                                    }

                                    $generatedEpisodes = [];
                                    $successCount = 0;

                                    // Reverse to match episode 1, 2, 3...
                                    $episodeList = array_reverse($episodeList);

                                    // Extend timeout limit since multiple HTTP requests can take long
                                    set_time_limit(120);

                                    // 2. Fetch video links for each episode concurrently but chunked by 3 to prevent timeouts
                                    $responses = [];
                                    $chunks = array_chunk($episodeList, 3);

                                    foreach ($chunks as $chunk) {
                                        $chunkResponses = Http::withoutVerifying()->pool(function (\Illuminate\Http\Client\Pool $pool) use ($chunk) {
                                            $reqs = [];
                                            foreach ($chunk as $epData) {
                                                $reqs[] = $pool->as($epData['slug'])->timeout(20)->get("https://api.satulagi.my.id/api/anime/episode/{$epData['slug']}");
                                            }
                                            return $reqs;
                                        });

                                        $responses = array_merge($responses, $chunkResponses);
                                    }

                                    foreach ($episodeList as $index => $epData) {
                                        $epNumber = $index + 1;
                                        $epSlug = $epData['slug'];
                                        $videoUrl = null;
                                        $downloadUrls = [];
                                        $mirrorStreams = [];

                                        // Try to get the video link from the successful pool response
                                        $epResponse = $responses[$epSlug] ?? null;
                                        if ($epResponse instanceof \Illuminate\Http\Client\Response && $epResponse->successful()) {
                                            $epJson = $epResponse->json();

                                            if (is_array($epJson)) {
                                                $videoUrl = $epJson['stream_url'] ?? null;
                                                if (!$videoUrl) {
                                                    $servers = $epJson['mirror_streams'] ?? [];
                                                    if (is_array($servers) && count($servers) > 0) {
                                                        $videoUrl = $servers[0]['stream_url'] ?? null;
                                                    }
                                                }
                                                $downloadUrls = $epJson['download_urls'] ?? [];
                                                $mirrorStreams = is_array($epJson['mirror_streams'] ?? null) ? $epJson['mirror_streams'] : [];
                                            }
                                        }

                                        $generatedEpisodes[(string) Str::uuid()] = [
                                            'number' => $epNumber,
                                            'title' => $epData['episode'] ?? "Episode {$epNumber}",
                                            'source_url' => "https://api.satulagi.my.id/api/anime/episode/{$epSlug}",
                                            'video_url' => $videoUrl,
                                            'mirror_streams' => $mirrorStreams,
                                            'download_urls' => $downloadUrls,
                                            'duration' => null,
                                            'release_date' => null,
                                        ];
                                        $successCount++;
                                    }

                                    // Set the repeater data
                                    $set('episodes', $generatedEpisodes);

                                    Notification::make()
                                        ->success()
                                        ->title("Generated {$successCount} episodes!")
                                        ->send();
                                }),
                        ]),
                    ])
                    ->collapsible()
                    ->collapsed(false)
                    ->columnSpanFull(),

                Section::make('Episodes')
                    ->schema([
                        Repeater::make('episodes')
                            ->relationship()
                            ->schema([
                                TextInput::make('number')
                                    ->numeric()
                                    ->required()
                                    ->minValue(1)
                                    ->default(1),
                                TextInput::make('title')
                                    ->required()
                                    ->placeholder('Episode title...'),

                                TextInput::make('source_url')
                                    ->label('Auto Scrape Episode (Satulagi URL)')
                                    ->placeholder('Enter https://api.satulagi.my.id/api/anime/episode/{slug}')
                                    ->helperText('Paste the Satulagi Episode API URL and click the scrape button to auto-fill the Video URL and Download Links.')
                                    ->dehydrated(false)
                                    ->columnSpanFull()
                                    ->suffixAction(
                                        \Filament\Actions\Action::make('scrape_episode')
                                            ->icon('heroicon-m-arrow-down-tray')
                                            ->action(function (Set $set, $state) {
                                                if (empty($state)) return;

                                                \Filament\Notifications\Notification::make()->info()->title('Fetching player...')->send();

                                                try {
                                                    $response = \Illuminate\Support\Facades\Http::withoutVerifying()
                                                        ->timeout(30)
                                                        ->get($state);

                                                    if ($response->successful()) {
                                                        $json = $response->json();

                                                        if (is_array($json)) {
                                                            $videoUrl = $json['stream_url'] ?? null;
                                                            if (!$videoUrl) {
                                                                $servers = $json['mirror_streams'] ?? [];
                                                                if (is_array($servers) && count($servers) > 0) {
                                                                    $videoUrl = $servers[0]['stream_url'] ?? null;
                                                                }
                                                            }

                                                            if ($videoUrl) {
                                                                $set('video_url', $videoUrl);
                                                            }

                                                            if (!empty($json['mirror_streams']) && is_array($json['mirror_streams'])) {
                                                                $set('mirror_streams', $json['mirror_streams']);
                                                            }

                                                            if (!empty($json['download_urls'])) {
                                                                $set('download_urls', $json['download_urls']);
                                                            }

                                                            if (!empty($json['episode'])) {
                                                                $set('title', $json['episode']);
                                                            }
                                                        }

                                                        \Filament\Notifications\Notification::make()
                                                            ->success()
                                                            ->title('Scraped successfully!')
                                                            ->send();
                                                    } else {
                                                        \Filament\Notifications\Notification::make()
                                                            ->danger()
                                                            ->title('Failed to fetch from Satulagi')
                                                            ->send();
                                                    }
                                                } catch (\Exception $e) {
                                                    \Filament\Notifications\Notification::make()
                                                        ->danger()
                                                        ->title('Error: ' . $e->getMessage())
                                                        ->send();
                                                }
                                            })
                                    ),

                                TextInput::make('video_url')
                                    ->label('Video URL (Embed Player)')
                                    ->placeholder('https://embed.example.com/video/...'),
                                Repeater::make('mirror_streams')
                                    ->label('Mirror Streams (Alternative Servers)')
                                    ->schema([
                                        TextInput::make('quality')->required(),
                                        TextInput::make('provider')->required(),
                                        TextInput::make('stream_url')->label('Stream URL')->required(),
                                    ])
                                    ->columns(3)
                                    ->columnSpanFull()
                                    ->collapsible()
                                    ->collapsed(true)
                                    ->defaultItems(0),
                                TextInput::make('duration')
                                    ->numeric()
                                    ->placeholder('24')
                                    ->suffix('min'),
                                TextInput::make('release_date')
                                    ->type('date')
                                    ->placeholder('YYYY-MM-DD'),
                                Repeater::make('download_urls')
                                    ->label('Download Links (JSON generated)')
                                    ->schema([
                                        TextInput::make('resolution')->required(),
                                        TextInput::make('size'),
                                        Repeater::make('urls')
                                            ->schema([
                                                TextInput::make('provider')->required(),
                                                TextInput::make('url')->url()->required(),
                                            ])
                                            ->columns(2)
                                            ->columnSpanFull()
                                    ])
                                    ->columnSpanFull()
                                    ->collapsible()
                                    ->collapsed(true),
                            ])
                            ->columns(2)
                            ->columnSpanFull()
                            ->defaultItems(0)
                            ->addActionLabel('Add Episode')
                            ->collapsible()
                            ->cloneable()
                            ->orderColumn('number')
                            ->reorderable(),
                    ])
                    ->collapsible()
                    ->columnSpanFull(),
            ]);
    }

    private static function fetchFromAnilist(int $id): ?array
    {
        $query = '
            query ($id: Int) {
                Media(id: $id, type: ANIME) {
                    id
                    title { romaji english native }
                    description(asHtml: false)
                    coverImage { extraLarge large }
                    bannerImage
                    format
                    status
                    episodes
                    seasonYear
                    averageScore
                    genres
                    studios(isMain: true) {
                        nodes { name }
                    }
                    trailer { id site }
                    characters(sort: [ROLE, FAVOURITES_DESC], perPage: 25) {
                        edges {
                            role
                            node {
                                id
                                name { full }
                                image { large }
                                description(asHtml: false)
                                gender
                                age
                                bloodType
                            }
                        }
                    }
                    staff(sort: [RELEVANCE], perPage: 15) {
                        edges {
                            role
                            node {
                                name { full }
                                image { large }
                            }
                        }
                    }
                }
            }
        ';

        $response = Http::withoutVerifying()->post(self::ANILIST_API, [
            'query' => $query,
            'variables' => ['id' => $id],
        ]);

        if ($response->failed()) return null;

        $media = $response->json('data.Media');
        if (!$media) return null;

        // Trailer URL
        $trailerUrl = null;
        if (isset($media['trailer']['id'], $media['trailer']['site'])) {
            if ($media['trailer']['site'] === 'youtube') {
                $trailerUrl = 'https://www.youtube.com/watch?v=' . $media['trailer']['id'];
            }
        }

        // Map format
        $typeMap = [
            'TV' => 'TV', 'TV_SHORT' => 'TV', 'MOVIE' => 'Movie',
            'SPECIAL' => 'Special', 'OVA' => 'OVA', 'ONA' => 'ONA', 'MUSIC' => 'Music',
        ];

        // Map status
        $statusMap = [
            'FINISHED' => 'Completed', 'RELEASING' => 'Ongoing',
            'NOT_YET_RELEASED' => 'Upcoming', 'CANCELLED' => 'Cancelled', 'HIATUS' => 'Hiatus',
        ];

        // Clean synopsis
        $synopsis = strip_tags($media['description'] ?? '');
        $synopsis = html_entity_decode($synopsis, ENT_QUOTES, 'UTF-8');
        $synopsis = trim(preg_replace('/\n{3,}/', "\n\n", $synopsis));

        // Characters
        $characters = [];
        foreach (($media['characters']['edges'] ?? []) as $i => $edge) {
            $charName = $edge['node']['name']['full'] ?? '';
            $charDesc = $edge['node']['description'] ?? null;
            if ($charDesc) {
                $charDesc = strip_tags($charDesc);
                $charDesc = html_entity_decode($charDesc, ENT_QUOTES, 'UTF-8');
                $charDesc = trim(preg_replace('/~!.*?!~/s', '', $charDesc)); // Remove spoiler tags
            }
            $characters[] = [
                'anilist_id' => $edge['node']['id'] ?? null,
                'name'       => $charName,
                'slug'       => $charName ? \Illuminate\Support\Str::slug($charName) : null,
                'image_url'  => $edge['node']['image']['large'] ?? '',
                'role'       => $edge['role'] === 'MAIN' ? 'Main' : 'Supporting',
                'description'=> $charDesc,
                'gender'     => $edge['node']['gender'] ?? null,
                'age'        => $edge['node']['age'] ?? null,
                'blood_type' => $edge['node']['bloodType'] ?? null,
                'sort_order' => $i,
            ];
        }

        // Staff
        $staff = [];
        foreach (($media['staff']['edges'] ?? []) as $i => $edge) {
            $staff[] = [
                'name' => $edge['node']['name']['full'] ?? '',
                'image_url' => $edge['node']['image']['large'] ?? '',
                'position' => $edge['role'] ?? 'Staff',
                'sort_order' => $i,
            ];
        }

        // Studio
        $studio = null;
        $studios = $media['studios']['nodes'] ?? [];
        if (count($studios) > 0) $studio = $studios[0]['name'];

        $title = $media['title']['romaji'] ?? $media['title']['english'] ?? '';

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'synopsis' => $synopsis,
            'poster_url' => $media['coverImage']['extraLarge'] ?? $media['coverImage']['large'] ?? '',
            'type' => $typeMap[$media['format'] ?? ''] ?? 'TV',
            'status' => $statusMap[$media['status'] ?? ''] ?? 'Ongoing',
            'rating' => $media['averageScore'] ? round($media['averageScore'] / 10, 1) : null,
            'release_year' => $media['seasonYear'] ?? null,
            'studio' => $studio,
            'trailer_url' => $trailerUrl,
            'episodes_count' => $media['episodes'] ?? null,
            'genres' => $media['genres'] ?? [],
            'characters' => $characters,
            'staff' => $staff,
        ];
    }
}
