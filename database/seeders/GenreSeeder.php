<?php

namespace Database\Seeders;

use App\Models\Genre;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class GenreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $genres = [
            ['name' => 'Action', 'icon' => '⚔️'],
            ['name' => 'Adventure', 'icon' => '🗺️'],
            ['name' => 'Comedy', 'icon' => '😂'],
            ['name' => 'Drama', 'icon' => '🎭'],
            ['name' => 'Ecchi', 'icon' => '🔞'],
            ['name' => 'Fantasy', 'icon' => '🪄'],
            ['name' => 'Horror', 'icon' => '👻'],
            ['name' => 'Mahou Shoujo', 'icon' => '✨'],
            ['name' => 'Mecha', 'icon' => '🤖'],
            ['name' => 'Music', 'icon' => '🎵'],
            ['name' => 'Mystery', 'icon' => '🔍'],
            ['name' => 'Psychological', 'icon' => '🧠'],
            ['name' => 'Romance', 'icon' => '❤️'],
            ['name' => 'Sci-Fi', 'icon' => '🚀'],
            ['name' => 'Slice of Life', 'icon' => '🍱'],
            ['name' => 'Sports', 'icon' => '⚽'],
            ['name' => 'Supernatural', 'icon' => '🔮'],
            ['name' => 'Thriller', 'icon' => '🔪'],
        ];

        foreach ($genres as $genre) {
            Genre::updateOrCreate(
                ['name' => $genre['name']],
                [
                    'slug' => Str::slug($genre['name']),
                    'icon' => $genre['icon'],
                ]
            );
        }
    }
}
