<?php

namespace App\Providers;

use App\Services\EnrollmentService;
use App\Services\LessonService;
use App\Services\ProgramService;
use App\Services\ResourceService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register services in the correct order to avoid circular dependencies

        // ResourceService has no dependencies on other services
        $this->app->singleton(ResourceService::class, function ($app) {
            return new ResourceService;
        });

        // ProgramService depends on ImageService (which you already have)
        // No modifications needed for your existing ProgramService registration
        // It will be extended with the new methods

        // EnrollmentService depends on ProgramService
        $this->app->singleton(EnrollmentService::class, function ($app) {
            return new EnrollmentService(
                $app->make(ProgramService::class)
            );
        });

        // LessonService depends on EnrollmentService
        $this->app->singleton(LessonService::class, function ($app) {
            return new LessonService(
                $app->make(EnrollmentService::class)
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
