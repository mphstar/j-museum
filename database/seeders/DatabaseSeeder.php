<?php

namespace Database\Seeders;

use App\Models\Museum;
use App\Models\MuseumOverlays;
use App\Models\User;
use App\Models\Setting;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Default user
        $user = User::factory()->create([
            'name' => 'Bintang',
            'email' => 'bintang@gmail.com',
            'password' => bcrypt('12345678'),
        ]);

        // Sample museum records
        $museum = Museum::factory()->count(2)->create();

        // 5 overlay records with alignment-only schema
        foreach (range(1,5) as $i) {
            MuseumOverlays::factory()->create([
                'museum_id' => $museum->random()->id,
            ]);
        }

        Setting::create([
            'style' => 'column',
        ]);

    }
}
