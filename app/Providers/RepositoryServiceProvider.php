<?php

namespace App\Providers;

use App\Repositories\EnrollmentRepository;
use App\Repositories\Interfaces\EnrollmentRepositoryInterface;
use App\Repositories\Interfaces\LessonProgressRepositoryInterface;
use App\Repositories\Interfaces\LessonRepositoryInterface;
use App\Repositories\Interfaces\NewsRepositoryInterface;
use App\Repositories\LessonProgressRepository;
use App\Repositories\LessonRepository;
use App\Repositories\NewsRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Bind the NewsRepositoryInterface to NewsRepository
        $this->app->bind(NewsRepositoryInterface::class, NewsRepository::class);
        $this->app->bind(LessonRepositoryInterface::class, LessonRepository::class);
        $this->app->bind(EnrollmentRepositoryInterface::class, EnrollmentRepository::class);
        $this->app->bind(LessonProgressRepositoryInterface::class, LessonProgressRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
