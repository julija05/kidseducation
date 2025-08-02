<?php

use App\Http\Controllers\Admin\AdminClassScheduleController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminLessonController;
use App\Http\Controllers\Admin\AdminLessonResourceController;
use App\Http\Controllers\Admin\AdminNewsController;
use App\Http\Controllers\Admin\AdminProgramController;
use App\Http\Controllers\Admin\AdminProgramResourcesController;
use App\Http\Controllers\Admin\AdminQuizController;
use App\Http\Controllers\Admin\EnrollmentApprovalController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\TestEmailController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Front\AboutController;
use App\Http\Controllers\Front\ContactController;
use App\Http\Controllers\Front\SignUpKidController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\LessonResourceController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\Student\EnrollmentController;
use App\Http\Controllers\Student\QuizController;
use Illuminate\Support\Facades\Route;

// Language switching
Route::get('/language/{locale}', [LanguageController::class, 'switch'])->name('language.switch');
Route::post('/language/set-preference', [LanguageController::class, 'setPreference'])->name('language.set-preference')->middleware('auth');

// Student dashboard
Route::middleware(['auth', 'role:student'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    // Program-specific dashboard
    Route::get('/dashboard/programs/{program:slug}', [DashboardController::class, 'showProgram'])->name('dashboard.programs.show');

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
    
    // Student notification actions
    Route::patch('/dashboard/notifications/mark-all-read', [DashboardController::class, 'markAllNotificationsAsRead'])->name('dashboard.notifications.mark-all-read');
    
    // Student schedule routes
    Route::get('/my-schedule', [DashboardController::class, 'mySchedule'])->name('my-schedule');

    Route::get('/lesson-resources/{lessonResource}/preview', [LessonResourceController::class, 'preview'])
        ->name('lesson-resources.preview');

    Route::get('/lesson-resources/{lessonResource}/serve', [LessonResourceController::class, 'serve'])
        ->name('lesson-resources.serve');

    // Quiz routes for students
    Route::prefix('quizzes')->name('student.quiz.')->group(function () {
        Route::get('/{quiz}', [QuizController::class, 'show'])->name('show');
        Route::post('/{quiz}/start', [QuizController::class, 'start'])->name('start');
        Route::get('/{quiz}/attempts/{attempt}', [QuizController::class, 'take'])->name('take');
        Route::post('/{quiz}/attempts/{attempt}/answer', [QuizController::class, 'submitAnswer'])->name('submit-answer');
        Route::post('/{quiz}/attempts/{attempt}/submit', [QuizController::class, 'submit'])->name('submit');
        Route::get('/{quiz}/attempts/{attempt}/result', [QuizController::class, 'result'])->name('result');
    });
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

    // Program Routes
    Route::resource('programs', AdminProgramController::class);
    Route::resource('news', AdminNewsController::class);

    // Program Lesson Management Routes
    Route::prefix('programs/{program}/lessons')->name('programs.lessons.')->group(function () {
        Route::get('/', [AdminLessonController::class, 'index'])->name('index');
        Route::get('/create', [AdminLessonController::class, 'create'])->name('create');
        Route::post('/', [AdminLessonController::class, 'store'])->name('store');
        Route::get('/{lesson}/edit', [AdminLessonController::class, 'edit'])->name('edit');
        Route::put('/{lesson}', [AdminLessonController::class, 'update'])->name('update');
        Route::delete('/{lesson}', [AdminLessonController::class, 'destroy'])->name('destroy');
        Route::post('/reorder', [AdminLessonController::class, 'reorder'])->name('reorder');
        Route::get('/level/{level}', [AdminLessonController::class, 'getLessonsForLevel'])->name('level');
    });

    // Enrollment Routes
    Route::get('/enrollments/pending', [EnrollmentApprovalController::class, 'index'])->name('enrollments.pending');
    Route::get('/enrollments', [EnrollmentApprovalController::class, 'all'])->name('enrollments.index');
    Route::post('/enrollments/{enrollment}/approve', [EnrollmentApprovalController::class, 'approve'])->name('enrollments.approve');
    Route::post('/enrollments/{enrollment}/reject', [EnrollmentApprovalController::class, 'reject'])->name('enrollments.reject');

    // Notification Routes
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::patch('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::post('/notifications/cleanup', [NotificationController::class, 'cleanup'])->name('notifications.cleanup');

    // Test Email Route (only in non-production)
    Route::get('/test-email', [TestEmailController::class, 'testStudentEmail'])->name('test.email');

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

    // Quiz Routes
    Route::resource('quizzes', AdminQuizController::class);
    Route::prefix('quizzes/{quiz}')->name('quizzes.')->group(function () {
        Route::post('/questions', [AdminQuizController::class, 'addQuestion'])->name('questions.store');
        Route::put('/questions/{question}', [AdminQuizController::class, 'updateQuestion'])->name('questions.update');
        Route::delete('/questions/{question}', [AdminQuizController::class, 'deleteQuestion'])->name('questions.destroy');
        Route::post('/questions/reorder', [AdminQuizController::class, 'reorderQuestions'])->name('questions.reorder');
        Route::post('/generate-question', [AdminQuizController::class, 'generateMentalArithmeticQuestion'])->name('generate-question');
        Route::post('/duplicate', [AdminQuizController::class, 'duplicateQuiz'])->name('duplicate');
        Route::get('/results', [AdminQuizController::class, 'results'])->name('results');
        Route::get('/student-results', [AdminQuizController::class, 'studentResults'])->name('student-results');
    });

    // Class Schedule Routes
    Route::prefix('class-schedules')->name('class-schedules.')->group(function () {
        Route::get('/', [AdminClassScheduleController::class, 'index'])->name('index');
        Route::get('/create', [AdminClassScheduleController::class, 'create'])->name('create');
        Route::post('/', [AdminClassScheduleController::class, 'store'])->name('store');
        
        // AJAX endpoints - MUST be before /{classSchedule} routes to avoid conflicts
        Route::get('/programs/{program}/lessons', [AdminClassScheduleController::class, 'getLessonsForProgram'])->name('program-lessons');
        Route::get('/programs/{program}/students', [AdminClassScheduleController::class, 'getStudentsForProgram'])->name('program-students');
        Route::post('/check-conflicts', [AdminClassScheduleController::class, 'checkConflicts'])->name('check-conflicts');
        
        Route::get('/{classSchedule}', [AdminClassScheduleController::class, 'show'])->name('show');
        Route::get('/{classSchedule}/edit', [AdminClassScheduleController::class, 'edit'])->name('edit');
        Route::put('/{classSchedule}', [AdminClassScheduleController::class, 'update'])->name('update');
        Route::post('/{classSchedule}/cancel', [AdminClassScheduleController::class, 'cancel'])->name('cancel');
        Route::post('/{classSchedule}/complete', [AdminClassScheduleController::class, 'complete'])->name('complete');
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
