<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Novel extends Model
{
    use HasFactory;

    protected $fillable = [
        'title','slug','synopsis','status','source_url','api_base_url','poster','type','author','artist','is_featured','rating','release_year','views_count','first_chapter_slug','first_chapter_title','first_chapter_url','last_synced_at','last_api_synced_at','api_sync_requested_at','api_sync_status','api_sync_error'
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'last_synced_at' => 'datetime',
        'last_api_synced_at' => 'datetime',
        'api_sync_requested_at' => 'datetime',
        'rating' => 'float',
    ];

    public function genres()
    {
        return $this->belongsToMany(Genre::class, 'novel_genre');
    }

    public function chapters()
    {
        return $this->hasMany(NovelChapter::class);
    }

    public function lastChapter()
    {
        return $this->hasOne(NovelChapter::class)->ofMany('position', 'min');
    }
}
