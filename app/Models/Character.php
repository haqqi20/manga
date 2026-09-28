<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Character extends Model
{
    protected $fillable = [
        'anime_id', 'anilist_id', 'name', 'slug', 'description',
        'image_url', 'role', 'sort_order', 'gender', 'age', 'blood_type',
    ];

    public function anime()
    {
        return $this->belongsTo(Anime::class);
    }

    public function favoritedByUsers()
    {
        return $this->belongsToMany(User::class, 'character_favorites')->withTimestamps();
    }

    public function getRouteKeyName(): string
    {
        return 'id';
    }
}
