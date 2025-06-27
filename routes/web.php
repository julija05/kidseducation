<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminNewsController;
use App\Http\Controllers\Admin\AdminProgramController;
use App\Http\Controllers\Admin\EnrollmentApprovalController;
use App\Http\Controllers\CountingOnAbacusController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Front\AboutController;
use App\Http\Controllers\Front\ContactController;
use App\Http\Controllers\Front\SignUpKidController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\Student\EnrollmentController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;


// Public routes (guests)
Route::get('/', [LandingController::class, 'index'])->name('landing.index');
Route::get('/about', [AboutController::class, 'index'])->name('about.index');
Route::get('/contact', [ContactController::class, 'index'])->name('contact.index');
Route::post('/contact', [ContactController::class, 'create'])->name('contact.create');
Route::get('/signupkid', [SignUpKidController::class, 'index'])->name('signupkid.index');

// Updated to use slug
Route::get('/programs', [ProgramController::class, 'index'])->name('programs.index');
Route::get('/programs/{program:slug}', [ProgramController::class, 'show'])->name('programs.show');

Route::get('/news', [NewsController::class, 'index']);
Route::post('/student', [StudentController::class, 'store'])->name('student.store');

// Student dashboard
Route::middleware(['auth', 'role:student'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Updated to use slug
    Route::get('/dashboard/programs/{program:slug}', [ProgramController::class, 'showDashboard'])
        ->name('dashboard.programs.show');

    Route::post('/programs/{program:slug}/enroll', [EnrollmentController::class, 'store'])->name('programs.enroll');
    Route::post('/enrollments/{enrollment}/cancel', [EnrollmentController::class, 'cancel'])->name('enrollments.cancel');

    Route::resource('counting-on-abacus', CountingOnAbacusController::class);
});

// Profile routes (shared)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin routes
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::resource('programs', AdminProgramController::class);
    Route::resource('news', AdminNewsController::class);

    Route::get('/enrollments/pending', [EnrollmentApprovalController::class, 'index'])->name('enrollments.pending');
    Route::get('/enrollments', [EnrollmentApprovalController::class, 'all'])->name('enrollments.index');
    Route::post('/enrollments/{enrollment}/approve', [EnrollmentApprovalController::class, 'approve'])->name('enrollments.approve');
    Route::post('/enrollments/{enrollment}/reject', [EnrollmentApprovalController::class, 'reject'])->name('enrollments.reject');
});



require __DIR__ . '/auth.php';
