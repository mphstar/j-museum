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
        // Create default Capaian Kompetensi
        $capaianKompetensi = [
            ['min' => 0, 'max' => 30, 'label' => 'membutuhkan bimbingan'],
            ['min' => 31, 'max' => 50, 'label' => 'menunjukkan pemahaman yang cukup'],
            ['min' => 51, 'max' => 70, 'label' => 'menunjukkan pemahaman yang baik'],
            ['min' => 71, 'max' => 100, 'label' => 'menunjukkan pemahaman yang sangat baik'],
        ];

        foreach ($capaianKompetensi as $ck) {
            CapaianKompetensi::create($ck);
        }

        // Create Kelas and Mata Pelajaran first
        $kelas = ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"];
        $mapel = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris", "IPA", "IPS"];

        foreach ($kelas as $k) {
            $kel = new Kelas();
            $kel->name = $k;
            $kel->save();

            foreach ($mapel as $m) {
                $map = new MataPelajaran();
                $map->name = $m;
                $map->kelas_id = $kel->id;
                $map->kategori = 'wajib';
                $map->save();
            }
        }

        // Create default user
        User::factory()->create([
            'name' => 'Bintang',
            'email' => 'bintang@gmail.com',
            'password' => bcrypt('12345678'),
        ]);

        // Call other seeders after kelas is created
        $this->call([
            PengaturanSeeder::class,
            StudentSeeder::class,
        ]);
    }
}
