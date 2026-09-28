<?php

namespace App\Filament\Resources\Episodes\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class EpisodeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('anime_id')
                    ->required()
                    ->numeric(),
                TextInput::make('title')
                    ->required(),
                TextInput::make('number')
                    ->required()
                    ->numeric(),

                TextInput::make('source_url')
                    ->label('Auto Scrape Episode (Satulagi URL)')
                    ->placeholder('Enter https://api.satulagi.my.id/api/anime/episode/{slug}')
                    ->helperText('Paste the Satulagi Episode API URL and click the scrape button to auto-fill the Video URL.')
                    ->dehydrated(false)
                    ->columnSpanFull()
                    ->suffixAction(
                        \Filament\Actions\Action::make('scrape_episode')
                            ->icon('heroicon-m-arrow-down-tray')
                            ->action(function (\Filament\Schemas\Components\Utilities\Set $set, $state) {
                                if (empty($state)) return;
                                
                                \Filament\Notifications\Notification::make()->info()->title('Fetching player...')->send();
                                
                                try {
                                    $response = \Illuminate\Support\Facades\Http::withoutVerifying()->timeout(30)->get($state);
                                        
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
                    ->default(null),
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
                    ->default(null),
                DatePicker::make('release_date'),
            ]);
    }
}
