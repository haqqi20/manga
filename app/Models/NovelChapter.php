<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NovelChapter extends Model
{
    use HasFactory;

    protected $fillable = ['novel_id','title','slug','chapter_number','position','source_url','content','views_count'];

    protected $casts = ['chapter_number' => 'float', 'position' => 'integer'];

    public function novel()
    {
        return $this->belongsTo(Novel::class);
    }

    public function images()
    {
        return $this->hasMany(NovelChapterImage::class)->orderBy('order');
    }
}
