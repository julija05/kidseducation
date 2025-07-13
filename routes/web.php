<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminLessonResourceController;
use App\Http\Controllers\Admin\AdminNewsController;
use App\Http\Controllers\Admin\AdminProgramController;
use App\Http\Controllers\Admin\AdminProgramResourcesController;
use App\Http\Controllers\Admin\EnrollmentApprovalController;
use App\Http\Controllers\CountingOnAbacusController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Front\AboutController;
use App\Http\Controllers\Front\ContactController;
use App\Http\Controllers\Front\SignUpKidController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\LessonResourceController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\Student\EnrollmentController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;



// Student dashboard
Route::middleware(['auth', 'role:student'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/programs/{program:slug}', [ProgramController::class, 'showDashboard'])
        ->name('dashboard.programs.show');

    Route::post('/programs/{program:slug}/enroll', [EnrollmentController::class, 'store'])->name('programs.enroll');
    Route::post('/enrollments/{enrollment}/cancel', [EnrollmentController::class, 'cancel'])->name('enrollments.cancel');


    // Individual lesson routes
    Route::get('/lessons/{lesson}', [LessonController::class, 'show'])->name('lessons.show');
    Route::post('/lessons/{lesson}/start', [LessonController::class, 'start'])->name('lessons.start');
    Route::patch('/lessons/{lesson}/progress', [LessonController::class, 'updateProgress'])->name('lessons.updateProgress');
    Route::post('/lessons/{lesson}/complete', [LessonController::class, 'complete'])->name('lessons.complete');

    // Lesson resource routes
    Route::get('/lesson-resources/{lessonResource}/download', [LessonResourceController::class, 'download'])->name('lesson-resources.download');
    Route::get('/lesson-resources/{lessonResource}/stream', [LessonResourceController::class, 'stream'])->name('lesson-resources.stream');
    Route::post('/lesson-resources/{lessonResource}/mark-viewed', [LessonResourceController::class, 'markAsViewed'])->name('lesson-resources.mark-viewed');

    // Dashboard lesson actions (AJAX endpoints)
    Route::post('/dashboard/lessons/{lesson}/start', [DashboardController::class, 'startLesson'])->name('dashboard.lessons.start');
    Route::post('/dashboard/lessons/{lesson}/complete', [DashboardController::class, 'completeLesson'])->name('dashboard.lessons.complete');
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

    // Resource Management Routes - MUST BE BEFORE program routes
    Route::prefix('resources')->name('resources.')->group(function () {
        // Overview of all programs and their resources
        Route::get('/', [AdminProgramResourcesController::class, 'index'])->name('index');

        // Get resource templates
        Route::get('/templates', [AdminProgramResourcesController::class, 'templates'])->name('templates');

        // Program-specific resource routes
        Route::prefix('program/{program}')->name('program.')->group(function () {
            // View resources for a specific program
            Route::get('/', [AdminProgramResourcesController::class, 'show'])->name('show');

            // Quick add resource form
            Route::get('/quick-add', [AdminProgramResourcesController::class, 'quickAdd'])->name('quickAdd');
            Route::post('/quick-add', [AdminProgramResourcesController::class, 'storeQuickAdd'])->name('storeQuickAdd');

            // Bulk import resources
            Route::post('/bulk-import', [AdminProgramResourcesController::class, 'bulkImport'])->name('bulkImport');
        });
    });

    // Program Routes - Remove the duplicate!
    Route::resource('programs', AdminProgramController::class);
    Route::resource('news', AdminNewsController::class);

    // Enrollment Routes
    Route::get('/enrollments/pending', [EnrollmentApprovalController::class, 'index'])->name('enrollments.pending');
    Route::get('/enrollments', [EnrollmentApprovalController::class, 'all'])->name('enrollments.index');
    Route::post('/enrollments/{enrollment}/approve', [EnrollmentApprovalController::class, 'approve'])->name('enrollments.approve');
    Route::post('/enrollments/{enrollment}/reject', [EnrollmentApprovalController::class, 'reject'])->name('enrollments.reject');

    // Lesson Resources Routes
    Route::prefix('lessons/{lesson}/resources')->name('lessons.resources.')->group(function () {
        Route::get('/', [AdminLessonResourceController::class, 'index'])->name('index');
        Route::get('/create', [AdminLessonResourceController::class, 'create'])->name('create');
        Route::post('/', [AdminLessonResourceController::class, 'store'])->name('store');
        Route::get('/{resource}/edit', [AdminLessonResourceController::class, 'edit'])->name('edit');
        Route::put('/{resource}', [AdminLessonResourceController::class, 'update'])->name('update');
        Route::delete('/{resource}', [AdminLessonResourceController::class, 'destroy'])->name('destroy');
        Route::post('/reorder', [AdminLessonResourceController::class, 'reorder'])->name('reorder');
        Route::post('/add-youtube', [AdminLessonResourceController::class, 'addYouTubeVideo'])->name('add-youtube');
    });
});


// Public routes (guests)

Route::get('/', [LandingController::class, 'index'])->name('landing.index');
Route::get('/about', [AboutController::class, 'index'])->name('about.index');
Route::get('/contact', [ContactController::class, 'index'])->name('contact.index');
Route::post('/contact', [ContactController::class, 'create'])->name('contact.create');
Route::get('/signupkid', [SignUpKidController::class, 'index'])->name('signupkid.index');
Route::get('/programs', [ProgramController::class, 'index'])->name('programs.index');
Route::get('/programs/{program:slug}', [ProgramController::class, 'show'])->name('programs.show');
Route::get('/news', [NewsController::class, 'index']);

require __DIR__ . '/auth.php';
