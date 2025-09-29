<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Nilai extends Model
{
    protected $table = 'nilai';
    protected $guarded = [];

    public function riwayat_kelas()
    {
        return $this->belongsTo(RiwayatKelas::class, 'riwayat_kelas_id', 'id');
    }

    public function detail_nilai()
    {
        return $this->hasMany(DetailNilai::class, 'nilai_id', 'id');
    }

    public function mata_pelajaran()
    {
        return $this->belongsTo(MataPelajaran::class, 'mata_pelajaran_id', 'id');
    }
}
