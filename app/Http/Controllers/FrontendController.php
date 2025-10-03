<?php

namespace App\Http\Controllers;

use App\Models\Museum;
use App\Models\Ruangan;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FrontendController extends Controller
{
    public function index()
    {
        $museum = Museum::with(['overlays', 'ruangan' => function($query) {
            $query->orderBy('is_main', 'desc')->orderBy('created_at', 'asc');
        }])->get();
        
        $setting = Setting::first();
        
        return Inertia::render('frontend/MuseumView', [
            'museum' => $museum,
            'setting' => $setting ?: ['style' => 'column'],
        ]);
    }

    public function showPanorama(Museum $museum)
    {
        // Load all ruangan with their markers for this museum
        $allRuangan = $museum->ruangan()->with('markers')->get();
        
        if ($allRuangan->isEmpty()) {
            abort(404, 'Museum tidak memiliki ruangan');
        }

        return Inertia::render('frontend/PanoramaViewer', [
            'museum' => $museum,
            'allRuangan' => $allRuangan,
        ]);
    }
}
