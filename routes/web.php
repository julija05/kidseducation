<?php

use App\Http\Controllers\Admin\AdminClassScheduleController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminLessonController;
use App\Http\Controllers\Admin\AdminLessonResourceController;
use App\Http\Controllers\Admin\AdminNewsController;
use App\Http\Controllers\Admin\AdminArticleController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\Admin\AdminProgramController;
use App\Http\Controllers\Admin\AdminProgramResourcesController;
use App\Http\Controllers\Admin\AdminQuizController;
use App\Http\Controllers\Admin\EnrollmentApprovalController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\TranslationController;
use App\Http\Controllers\Admin\AdminChatController;
use App\Http\Controllers\ChatController;
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
use App\Http\Controllers\Student\ReviewController;
use App\Http\Controllers\DemoController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\HelpController;
use App\Http\Controllers\CertificateController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Language switching - IMPORTANT: Specific routes must come before parameterized routes
Route::post('/language/set-preference', [LanguageController::class, 'setPreference'])->name('language.set-preference')->middleware('auth');
Route::get('/language/{locale}', [LanguageController::class, 'switch'])->name('language.switch');
Route::post('/language/{locale}', [LanguageController::class, 'switch'])->name('language.switch.post');

// Debug route for language preference
Route::post('/debug/language-preference', function(Request $request) {
    \Log::info('DEBUG: Language preference request', [
        'all_data' => $request->all(),
        'method' => $request->method(),
        'user' => Auth::user()?->only(['id', 'name', 'language_preference']),
    ]);
    
    // Return an Inertia response instead of JSON
    return back()->with('success', 'Debug route hit successfully');
})->middleware('auth');

// Student dashboard
Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

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

    // Review routes for students
    Route::prefix('reviews')->name('reviews.')->group(function () {
        Route::get('/', [ReviewController::class, 'index'])->name('index');
        Route::get('/programs/{program:slug}/create', [ReviewController::class, 'create'])->name('programs.create');
        Route::post('/programs/{program:slug}', [ReviewController::class, 'store'])->name('programs.store');
        Route::get('/{review}/edit', [ReviewController::class, 'edit'])->name('edit');
        Route::patch('/{review}', [ReviewController::class, 'update'])->name('update');
        Route::delete('/{review}', [ReviewController::class, 'destroy'])->name('destroy');
    });

    // Certificate routes for students
    Route::prefix('certificates')->name('certificates.')->group(function () {
        Route::get('/', [CertificateController::class, 'index'])->name('index');
        Route::post('/programs/{program:slug}/generate', [CertificateController::class, 'generate'])->name('generate');
        Route::get('/programs/{program:slug}/check', [CertificateController::class, 'checkEligibility'])->name('check');
        Route::get('/view/{filename}', [CertificateController::class, 'view'])->name('view');
        Route::get('/download/{filename}', [CertificateController::class, 'download'])->name('download');
    });
});

// Profile routes (shared)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/theme', [ProfileController::class, 'updateTheme'])->name('profile.theme');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
});

// Admin routes
Route::middleware(['auth', 'role:admin', 'admin.english'])->prefix('admin')->name('admin.')->group(function () {
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
    Route::resource('articles', AdminArticleController::class);

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

    // Chat Routes
    Route::prefix('chat')->name('chat.')->group(function () {
        Route::get('/', [AdminChatController::class, 'index'])->name('index');
        Route::get('/conversations', [AdminChatController::class, 'getConversations'])->name('conversations');
        Route::post('/conversations/{conversation}/take', [AdminChatController::class, 'takeConversation'])->name('take');
        Route::post('/send', [AdminChatController::class, 'sendMessage'])->name('send');
        Route::get('/conversations/{conversation}/messages', [AdminChatController::class, 'getMessages'])->name('messages');
        Route::post('/conversations/{conversation}/close', [AdminChatController::class, 'closeConversation'])->name('close');
        Route::delete('/conversations/{conversation}', [AdminChatController::class, 'deleteConversation'])->name('delete');
        Route::post('/conversations/{conversation}/transfer', [AdminChatController::class, 'transferConversation'])->name('transfer');
        Route::get('/stats', [AdminChatController::class, 'getStats'])->name('stats');
    });

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

    // Translation Routes
    Route::prefix('translations')->name('translations.')->group(function () {
        Route::get('/', [TranslationController::class, 'index'])->name('index');
        Route::get('/programs/{program:id}', [TranslationController::class, 'showProgram'])->name('programs.show-translation');
        Route::post('/programs/{program:id}', [TranslationController::class, 'updateProgram'])->name('programs.update');
        Route::post('/lessons/{lesson:id}', [TranslationController::class, 'updateLesson'])->name('lessons.update');
        Route::post('/resources/{resource:id}', [TranslationController::class, 'updateResource'])->name('resources.update');
    });
});


// Public routes (guests)

Route::get('/', [LandingController::class, 'index'])->name('landing.index');
Route::get('/about', [AboutController::class, 'index'])->name('about.index');
Route::get('/contact', [ContactController::class, 'index'])->name('contact.index');
Route::post('/contact', [ContactController::class, 'create'])->name('contact.create');

// Chat routes (public)
Route::post('/chat/init', [ChatController::class, 'initChat'])->name('chat.init');
Route::post('/chat/send', [ChatController::class, 'sendMessage'])->name('chat.send');
Route::get('/chat/{conversation}/messages', [ChatController::class, 'getMessages'])->name('chat.messages');
Route::post('/chat/{conversation}/close', [ChatController::class, 'closeConversation'])->name('chat.close');
Route::get('/chat/{conversation}/status', [ChatController::class, 'checkStatus'])->name('chat.status');
Route::get('/signupkid', [SignUpKidController::class, 'index'])->name('signupkid.index');
Route::get('/programs', [ProgramController::class, 'index'])->name('programs.index');
Route::get('/programs/{program:slug}', [ProgramController::class, 'show'])->name('programs.show');
Route::get('/news', [NewsController::class, 'index']);
Route::get('/articles', [ArticleController::class, 'index'])->name('articles.index');
Route::get('/articles/{article:slug}', [ArticleController::class, 'show'])->name('articles.show');

// Legal pages
Route::get('/privacy-policy', [LegalController::class, 'privacy'])->name('legal.privacy');
Route::get('/terms-of-service', [LegalController::class, 'terms'])->name('legal.terms');

// Help & Support pages
Route::get('/help', [HelpController::class, 'index'])->name('help.index');
Route::get('/help/search', [HelpController::class, 'search'])->name('help.search');
Route::get('/help/{slug}', [HelpController::class, 'show'])->name('help.article');

// Demo account routes
Route::prefix('demo')->name('demo.')->group(function () {
    Route::get('/{program:slug}', [DemoController::class, 'showDemoForm'])->name('access');
    Route::post('/{program:slug}/create', [DemoController::class, 'createDemoAccount'])->name('create');
    Route::get('/{program:slug}/dashboard', [DemoController::class, 'dashboard'])->name('dashboard')->middleware('auth');
    Route::post('/{program:slug}/enroll', [DemoController::class, 'convertToEnrollment'])->name('enroll')->middleware('auth');
    Route::post('/logout', [DemoController::class, 'logout'])->name('logout')->middleware('auth');
    Route::get('/expired', [DemoController::class, 'expired'])->name('expired');
});


require __DIR__ . '/auth.php';
