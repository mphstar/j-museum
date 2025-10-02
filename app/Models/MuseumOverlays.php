<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MuseumOverlays extends Model
{
    use HasFactory;
    protected $table = 'museum_overlays';
    protected $fillable = [
        'museum_id',
        'overlay_url',
        'position_horizontal','position_vertical','object_fit'
    ];

    protected $casts = [];

    public function museum()
    {
        return $this->belongsTo(Museum::class);
    }
}
