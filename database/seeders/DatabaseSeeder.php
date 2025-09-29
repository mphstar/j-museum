<?php

namespace Database\Seeders;

use App\Models\CapaianKompetensi;
use App\Models\Kelas;
use App\Models\MataPelajaran;
use App\Models\Materi;
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
        // Create default user
        User::factory()->create([
            'name' => 'Bintang',
            'email' => 'bintang@gmail.com',
            'password' => bcrypt('12345678'),
        ]);

    }
}
