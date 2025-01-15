<?php

use App\Http\Controllers\CountingOnAbacusController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Front\AboutController;
use App\Http\Controllers\Front\ContactController;
use App\Http\Controllers\Front\SignUpKidController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [LandingController::class,'index'])->name('landing.index');
Route::get('/about', [AboutController::class,'index'])->name('about.index');
Route::get('/contact', [ContactController::class,'index'])->name('contact.index');
Route::get('/signupkid', [SignUpKidController::class,'index'])->name('signupkid.index');

Route::get('/dashboard',[DashboardController::class,'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::resource( 'counting-on-abacus', CountingOnAbacusController::class);
});

require __DIR__.'/auth.php';
