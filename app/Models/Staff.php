<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    protected $table = 'staff';
    
    protected $fillable = [
        'anime_id', 'name', 'image_url', 'position', 'sort_order'
    ];

    public function anime()
    {
        return $this->belongsTo(Anime::class);
    }
}
