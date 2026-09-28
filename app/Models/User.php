<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasAvatar;
use Filament\Panel;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable implements FilamentUser, HasAvatar
{
    public function getFilamentAvatarUrl(): ?string
    {
        return $this->avatar_url;
    }

    public function getAvatarUrlAttribute($value): ?string
    {
        if (!$value) return null;
        if (filter_var($value, FILTER_VALIDATE_URL)) return $value;
        return asset('storage/' . $value);
    }
    public function canAccessPanel(Panel $panel): bool
    {
        return (bool) $this->is_admin;
    }
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'google_id',
        'is_admin',
        'avatar_url',
        'cover_url',
        'bio',
        'profile_public',
        'badge',
        'login_history',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'profile_public' => 'boolean',
            'login_history' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function ($user) {
            if (empty($user->username)) {
                $base = \Illuminate\Support\Str::slug($user->name, '_') ?: 'user';
                $username = $base;
                $i = 1;
                while (static::where('username', $username)->exists()) {
                    $username = $base . '_' . $i++;
                }
                $user->username = $username;
            }
        });
    }

    public function bookmarkedAnimes()
    {
        return $this->belongsToMany(Anime::class, 'bookmarks')->withTimestamps()->orderByDesc('bookmarks.created_at');
    }
    public function bookmarkedMangas()
    {
        return $this->belongsToMany(Manga::class, 'manga_bookmarks')->withTimestamps()->orderByDesc('manga_bookmarks.created_at');
    }
    public function favoritedCharacters()
    {
        return $this->belongsToMany(Character::class, 'character_favorites')->withTimestamps()->orderByDesc('character_favorites.created_at');
    }

    public function watchHistories()
    {
        return $this->hasMany(WatchHistory::class)->orderByDesc('updated_at');
    }
    public function mangaHistories()
    {
        return $this->hasMany(MangaHistory::class)->orderByDesc('updated_at');
    }
    public function comments()
    {
        return $this->hasMany(Comment::class)->latest();
    }

    /** Users this user is following */
    public function following()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')->withTimestamps();
    }

    /** Users who follow this user */
    public function followers()
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')->withTimestamps();
    }

    public function isFollowing(User $user): bool
    {
        return $this->following()->where('following_id', $user->id)->exists();
    }
}
