<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Routing\Route;

class RiwayatKelas extends Model
{
    protected $table = 'riwayat_kelas';
    protected $guarded = [];

    public function nilai_mapel()
    {
        $mataPelajaranId = request()->route('id') ?? Route::current()->parameter('id');

        return $this->hasOne(Nilai::class)->where('mata_pelajaran_id', $mataPelajaranId);
    }

    public function nilai()
    {
        return $this->hasMany(Nilai::class, 'riwayat_kelas_id', 'id');
    }

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id', 'id');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'kelas_id', 'id');
    }
}
