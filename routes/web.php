<?php

use App\Http\Controllers\CountingOnAbacusController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Front\AboutController;
use App\Http\Controllers\Front\ContactController;
use App\Http\Controllers\Front\SignUpKidController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\StudentController;
use App\Models\Program;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('guest')->group(function () {
    Route::get('/', [LandingController::class, 'index'])->name('landing.index');
    Route::get('/about', [AboutController::class, 'index'])->name('about.index');
    Route::get('/contact', [ContactController::class, 'index'])->name('contact.index');
    Route::post('/contact', [ContactController::class, 'create'])->name('contact.create');
    Route::get('/signupkid', [SignUpKidController::class, 'index'])->name('signupkid.index');
    // Route::get('/programs/{program}', [ProgramController::class, 'show'])->name('programs.show');
    Route::resource('/programs', ProgramController::class)->only('index', 'show');
    Route::post('/student', [StudentController::class, 'store'])->name('student.store');
    Route::get('/test-500', function () {
        // This will trigger a 500 error
        abort(500, 'This is a test 500 error');
    });
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::resource('counting-on-abacus', CountingOnAbacusController::class);
});

Route::fallback(function () {
    return Inertia::render('Error/Error', [
        'status' => 404,
        'message' => 'Page Not Found'
    ])->toResponse(request())->setStatusCode(404);
});


require __DIR__ . '/auth.php';
