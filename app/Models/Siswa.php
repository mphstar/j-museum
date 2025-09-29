<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Siswa extends Model
{
    protected $table = 'siswa';
    protected $guarded = [];

    public function riwayat_kelas()
    {
        return $this->hasMany(RiwayatKelas::class, 'siswa_id', 'id');
    }

    public function kelas_aktif()
    {
        return $this->hasOne(RiwayatKelas::class, 'siswa_id', 'id')->where('status', 'aktif');
    }

    public function tahun_akademik()
    {
        return $this->belongsTo(TahunAkademik::class, 'tahun_akademik_id');
    }
}
