<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            GenreSeeder::class,
        ]);

        User::factory()->create([
            'name' => 'Administrator',
            'email' => 'admin@hestia.com',
            'password' => bcrypt('admin'),
            'is_admin' => true,
        ]);

        User::factory()->create([
            'name' => 'Normal User',
            'email' => 'user@user.com',
            'password' => bcrypt('password'),
            'is_admin' => false,
        ]);
    }
}
