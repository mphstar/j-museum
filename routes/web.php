<?php

use App\Http\Controllers\Admin\PariwisataController;
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

    Route::prefix('pariwisata')->group(function () {
        Route::get('/', [PariwisataController::class, 'index'])->name('pariwisata.index');
        Route::get('create', [PariwisataController::class, 'create'])->name('pariwisata.create');
        Route::post('store', [PariwisataController::class, 'store'])->name('pariwisata.store');
        Route::get('edit/{pariwisata}', [PariwisataController::class, 'edit'])->name('pariwisata.edit');
        Route::post('update/{pariwisata}', [PariwisataController::class, 'update'])->name('pariwisata.update');
    Route::post('delete/{pariwisata}', [PariwisataController::class, 'destroy'])->name('pariwisata.destroy');
        Route::post('delete-multiple', [PariwisataController::class, 'deleteMultiple'])->name('pariwisata.delete-multiple');
        Route::post('upload-background', [PariwisataController::class, 'uploadBackground'])->name('pariwisata.upload-background');

        // Overlays
        Route::post('{pariwisata}/overlays', [PariwisataController::class, 'storeOverlay'])->name('pariwisata.overlays.store');
        Route::post('overlays/{overlay}', [PariwisataController::class, 'updateOverlay'])->name('pariwisata.overlays.update');
        Route::post('overlays/{overlay}/delete', [PariwisataController::class, 'deleteOverlay'])->name('pariwisata.overlays.delete');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
