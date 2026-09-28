<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Episode extends Model
{
    protected $fillable = [
        'anime_id', 'title', 'number', 'video_url', 'mirror_streams', 'download_urls', 'duration', 'release_date'
    ];

    protected $casts = [
        'download_urls' => 'array',
        'mirror_streams' => 'array',
    ];

    public function anime()
    {
        return $this->belongsTo(Anime::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->latest();
    }

    protected static function booted()
    {
        static::saved(function ($episode) {
            \Illuminate\Support\Facades\Cache::forget('episode_detail_' . $episode->anime_id . '_' . $episode->number);
            if ($episode->anime) {
                \Illuminate\Support\Facades\Cache::forget('episode_anime_' . $episode->anime->slug);
                \Illuminate\Support\Facades\Cache::forget('anime_show_slug_' . $episode->anime->slug);
            }
            \Illuminate\Support\Facades\Cache::forget('home_latest_updates');
            \Illuminate\Support\Facades\Cache::forget('home_popular');
        });

        static::deleted(function ($episode) {
            \Illuminate\Support\Facades\Cache::forget('episode_detail_' . $episode->anime_id . '_' . $episode->number);
            if ($episode->anime) {
                \Illuminate\Support\Facades\Cache::forget('episode_anime_' . $episode->anime->slug);
                \Illuminate\Support\Facades\Cache::forget('anime_show_slug_' . $episode->anime->slug);
            }
            \Illuminate\Support\Facades\Cache::forget('home_latest_updates');
            \Illuminate\Support\Facades\Cache::forget('home_popular');
        });
    }
}
