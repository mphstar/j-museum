<?php

use App\Http\Controllers\Admin\TahunAkademikController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::get('/glitchtip/error', function () {
    throw new Exception('My first GlitchTip error!');
});

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/stats', [DashboardController::class, 'getStats'])->name('dashboard.stats');


    Route::prefix('user')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('user.index');
        Route::post('store', [UserController::class, 'store'])->name('user.store');
        Route::post('delete-multiple', [UserController::class, 'deleteMultiple'])->name('user.delete-multiple');
        Route::post('delete', [UserController::class, 'delete'])->name('user.delete');
        Route::post('update', [UserController::class, 'update'])->name('user.update');
    });


    
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
