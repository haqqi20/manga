<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Manga extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'synopsis',
        'status',
        'source_url',
        'poster',
        'type',
        'author',
        'artist',
        'is_featured',
        'rating',
        'release_year',
        'views_count',
    ];

    public function genres()
    {
        return $this->belongsToMany(Genre::class, 'manga_genre');
    }

    public function chapters()
    {
        return $this->hasMany(Chapter::class);
    }

    public function lastChapter()
    {
        return $this->hasOne(Chapter::class)->latestOfMany('chapter_number');
    }
    public function userHistory()
    {
        return $this->hasMany(MangaHistory::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->whereNull('parent_id')->with(['user', 'replies.user'])->latest();
    }
}
