<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Anime extends Model
{
    protected $fillable = [
        'anilist_id', 'title', 'slug', 'synopsis', 'status', 'type', 'poster', 'rating', 'release_year', 'studio', 'trailer_url', 'is_featured', 'episodes_count'
    ];

    protected $casts = [
        'is_featured' => 'boolean',
    ];

    public function getPosterAttribute($value)
    {
        if (!$value) return null;
        if (filter_var($value, FILTER_VALIDATE_URL)) return $value;
        return asset('storage/' . $value);
    }

    public function genres()
    {
        return $this->belongsToMany(Genre::class);
    }

    public function episodes()
    {
        return $this->hasMany(Episode::class);
    }

    public function characters()
    {
        return $this->hasMany(Character::class)->orderBy('sort_order');
    }

    public function staff()
    {
        return $this->hasMany(Staff::class)->orderBy('sort_order');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->latest();
    }

    protected static function booted()
    {
        static::saved(function ($anime) {
            \Illuminate\Support\Facades\Cache::forget('anime_show_slug_' . $anime->slug);
            \Illuminate\Support\Facades\Cache::forget('episode_anime_' . $anime->slug);
            \Illuminate\Support\Facades\Cache::forget('home_featured');
            \Illuminate\Support\Facades\Cache::forget('home_latest_updates');
            \Illuminate\Support\Facades\Cache::forget('home_popular');
            \Illuminate\Support\Facades\Cache::forget('home_recommended');
        });

        static::deleted(function ($anime) {
            \Illuminate\Support\Facades\Cache::forget('anime_show_slug_' . $anime->slug);
            \Illuminate\Support\Facades\Cache::forget('episode_anime_' . $anime->slug);
            \Illuminate\Support\Facades\Cache::forget('home_featured');
            \Illuminate\Support\Facades\Cache::forget('home_latest_updates');
            \Illuminate\Support\Facades\Cache::forget('home_popular');
            \Illuminate\Support\Facades\Cache::forget('home_recommended');
        });
    }
}
