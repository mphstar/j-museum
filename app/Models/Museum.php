<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Museum extends Model
{
    use HasFactory;
    protected $table = 'museum';

    protected $fillable = [
        'title','label','subtitle','slug','content','background_url','cta_href','cta_label','align','latitude','longitude'
    ];

    public function overlays()
    {
        return $this->hasMany(MuseumOverlays::class, 'museum_id');
    }

    public function ruangan()
    {
        return $this->hasMany(Ruangan::class, 'museum_id');
    }
}
