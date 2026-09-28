<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = ['user_id', 'episode_id', 'manga_id', 'chapter_id', 'type', 'message', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function episode()
    {
        return $this->belongsTo(Episode::class);
    }

    public function manga()
    {
        return $this->belongsTo(Manga::class);
    }

    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }
}
