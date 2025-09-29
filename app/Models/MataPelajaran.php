<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MataPelajaran extends Model
{
    protected $table = 'mata_pelajaran';
    protected $guarded = [];

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }

    // public function getKategoriAttribute($value)
    // {
    //     return $value === 'wajib' ? 'Wajib' : 'Ekstrakurikuler';
    // }
}
