<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pariwisata extends Model
{
    use HasFactory;
    protected $table = 'pariwisata';

    protected $fillable = [
        'title','label','subtitle','slug','content','background_url','cta_href','cta_label','align'
    ];

    public function overlays()
    {
        return $this->hasMany(PariwisataOverlays::class, 'pariwisata_id');
    }
}
