<?php

use App\Http\Controllers\ChirpController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::post('chirps/update/{chirp}', [ChirpController::class, '_update'])
    ->name('chirps.update')
    ->middleware(['auth', 'verified']);
Route::resource('chirps', ChirpController::class)
    ->only(['index', 'store', 'destroy'])
    ->middleware(['auth', 'verified']);

Route::post('create_chirp', [UserController::class, 'create_chirp'])->name('user.create_chirp');
Route::resource('user/{user}', UserController::class)
    ->only(['index'])
    ->name('index', 'user.index')
    ->middleware(['auth']);

Route::post('chirps/{chirp}/like', [LikeController::class, 'toggle'])
    ->name('like')
    ->middleware(['auth', 'verified']);;

require __DIR__.'/auth.php';
