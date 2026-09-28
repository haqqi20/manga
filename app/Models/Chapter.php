<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chapter extends Model
{
    use HasFactory;

    protected $fillable = [
        'manga_id',
        'title',
        'slug',
        'chapter_number',
        'source_url',
        'content',
        'views_count',
    ];

    protected $casts = [
        'chapter_number' => 'float',
    ];

    public function manga()
    {
        return $this->belongsTo(Manga::class);
    }

    public function images()
    {
        return $this->hasMany(ChapterImage::class)->orderBy('order');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->whereNull('parent_id')->with(['user', 'replies.user'])->latest();
    }
}
