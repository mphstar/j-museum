<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\User;
use App\Models\Kelas;
use App\Models\MataPelajaran;
use App\Models\Ppdb;
use App\Models\Keuangan;
use App\Models\Presensi;
use App\Models\Materi;
use App\Models\Nilai;
use App\Models\TahunAkademik;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        
        return Inertia::render('dashboard', [
        ]);
    }

    /**
     * Get dashboard statistics for API calls
     */
    
}
