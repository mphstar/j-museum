<?php

use App\Http\Controllers\Admin\MuseumController;
use App\Http\Controllers\Admin\SettingController;
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

    Route::prefix('museum')->group(function () {
        Route::get('/', [MuseumController::class, 'index'])->name('museum.index');
        Route::get('create', [MuseumController::class, 'create'])->name('museum.create');
        Route::post('store', [MuseumController::class, 'store'])->name('museum.store');
        Route::get('edit/{museum}', [MuseumController::class, 'edit'])->name('museum.edit');
        Route::post('update/{museum}', [MuseumController::class, 'update'])->name('museum.update');
    Route::post('delete/{museum}', [MuseumController::class, 'destroy'])->name('museum.destroy');
        Route::post('delete-multiple', [MuseumController::class, 'deleteMultiple'])->name('museum.delete-multiple');
        Route::post('upload-background', [MuseumController::class, 'uploadBackground'])->name('museum.upload-background');

        // Overlays
        Route::post('{museum}/overlays', [MuseumController::class, 'storeOverlay'])->name('museum.overlays.store');
        Route::post('overlays/{overlay}', [MuseumController::class, 'updateOverlay'])->name('museum.overlays.update');
        Route::post('overlays/{overlay}/delete', [MuseumController::class, 'deleteOverlay'])->name('museum.overlays.delete');
    });

    Route::prefix('settings')->group(function () {
        Route::post('update', [SettingController::class, 'update'])->name('settings.update');
        Route::get('/', [SettingController::class, 'getSettings'])->name('settings.get');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
