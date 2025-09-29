<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ppdb extends Model
{
    protected $table = 'ppdb';

    protected $fillable = [
        'nama_lengkap',
        'nama_panggilan', 
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'agama',
        'alamat',
        'no_telepon',
        'pendidikan_sebelumnya',
        'pilihan_seni',
        'nama_ayah',
        'nama_ibu',
        'pekerjaan_ayah',
        'pekerjaan_ibu',
        'jalan',
        'kelurahan',
        'kecamatan',
        'kabupaten',
        'provinsi',
        'nama_wali',
        'pekerjaan_wali',
        'alamat_wali',
        'no_telepon_wali',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];
}
