<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MuseumApiController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Museum API Routes
Route::prefix('museums')->group(function () {
    // Get all museums with relations
    Route::get('/', [MuseumApiController::class, 'index']);
    
    // Get museums with statistics
    Route::get('/stats', [MuseumApiController::class, 'withStats']);
    
    // Get single museum by ID
    Route::get('/{id}', [MuseumApiController::class, 'show'])->where('id', '[0-9]+');
    
    // Get museum by slug
    Route::get('/slug/{slug}', [MuseumApiController::class, 'showBySlug']);
});
