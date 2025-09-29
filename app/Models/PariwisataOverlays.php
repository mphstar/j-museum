<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PariwisataOverlays extends Model
{
    use HasFactory;
    protected $table = 'pariwisata_overlays';
    protected $fillable = [
        'pariwisata_id',
        'overlay_url',
        'position_horizontal','position_vertical','object_fit'
    ];

    protected $casts = [];

    public function pariwisata()
    {
        return $this->belongsTo(Pariwisata::class);
    }
}
