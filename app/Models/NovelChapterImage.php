<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NovelChapterImage extends Model
{
    use HasFactory;

    protected $fillable = ['novel_chapter_id','image_path','order'];

    public function chapter()
    {
        return $this->belongsTo(NovelChapter::class, 'novel_chapter_id');
    }
}
