<?php

namespace App\Providers;

use App\Contracts\EnrollmentRepositoryInterface;
use App\Contracts\ResourceAccessInterface;
use App\Contracts\ResourceFormatterInterface;
use App\Repositories\EnrollmentRepository;
use App\Repositories\Interfaces\EnrollmentRepositoryInterface as RepositoryEnrollmentInterface;
use App\Repositories\Interfaces\LessonProgressRepositoryInterface;
use App\Repositories\Interfaces\LessonRepositoryInterface;
use App\Repositories\Interfaces\NewsRepositoryInterface;
use App\Repositories\Interfaces\ProgramRepositoryInterface;
use App\Repositories\LessonProgressRepository;
use App\Repositories\LessonRepository;
use App\Repositories\NewsRepository;
use App\Repositories\ProgramRepository;
use App\Services\EnrollmentAccessService;
use App\Services\ResourceFormatter;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Bind repository interfaces to implementations (App\Contracts namespace)
        $this->app->bind(EnrollmentRepositoryInterface::class, EnrollmentRepository::class);

        // Bind repository interfaces to implementations (App\Repositories\Interfaces namespace)
        $this->app->bind(RepositoryEnrollmentInterface::class, EnrollmentRepository::class);
        $this->app->bind(LessonRepositoryInterface::class, LessonRepository::class);
        $this->app->bind(LessonProgressRepositoryInterface::class, LessonProgressRepository::class);
        $this->app->bind(ProgramRepositoryInterface::class, ProgramRepository::class);
        $this->app->bind(NewsRepositoryInterface::class, NewsRepository::class);

        // Bind service interfaces to implementations
        $this->app->bind(ResourceAccessInterface::class, EnrollmentAccessService::class);
        $this->app->bind(ResourceFormatterInterface::class, ResourceFormatter::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
