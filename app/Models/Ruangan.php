<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ruangan extends Model
{
    protected $table = 'ruangan';

    protected $guarded = ['id'];

    public function museum()
    {
        return $this->belongsTo(Museum::class, 'museum_id');
    }

    public function markers()
    {
        return $this->hasMany(MarkerRuangan::class, 'ruangan_id');
    }
}
