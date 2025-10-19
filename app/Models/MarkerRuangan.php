<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarkerRuangan extends Model
{
    protected $table = 'marker_ruangan';

    protected $guarded = ['id'];

    protected $casts = [
        'position_yaw' => 'float',
        'position_pitch' => 'float',
        'media_width' => 'integer',
        'media_height' => 'integer',
    ];

    public function ruangan()
    {
        return $this->belongsTo(Ruangan::class, 'ruangan_id');
    }

    public function targetRuangan()
    {
        return $this->belongsTo(Ruangan::class, 'navigation_target');
    }

}
