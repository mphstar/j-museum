<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Presensi extends Model
{
    protected $table = 'presensi';
    protected $guarded = [];

    public function riwayat_kelas()
    {
        return $this->belongsTo(RiwayatKelas::class, 'riwayat_kelas_id');
    }
}
