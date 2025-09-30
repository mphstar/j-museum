<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Pariwisata;
use App\Models\PariwisataOverlays;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'totalUsers' => User::count(),
            'totalPariwisata' => Pariwisata::count(),
            'totalOverlays' => PariwisataOverlays::count(),
            'recentPariwisata' => Pariwisata::latest()->take(5)->get(),
        ];

        $setting = Setting::first();
        
        return Inertia::render('dashboard', [
            'stats' => $stats,
            'setting' => $setting ?: ['style' => 'column'],
        ]);
    }

    /**
     * Get dashboard statistics for API calls
     */
    public function getStats()
    {
        $stats = [
            'totalUsers' => User::count(),
            'totalPariwisata' => Pariwisata::count(),
            'totalOverlays' => PariwisataOverlays::count(),
            'recentPariwisata' => Pariwisata::latest()->take(5)->get(),
        ];

        return response()->json($stats);
    }
}
