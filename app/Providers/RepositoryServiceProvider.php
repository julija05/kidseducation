<?php

namespace App\Providers;

use App\Contracts\EnrollmentRepositoryInterface;
use App\Contracts\ResourceAccessInterface;
use App\Contracts\ResourceFormatterInterface;
use App\Repositories\EnrollmentRepository;
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
        // Bind repository interfaces to implementations
        $this->app->bind(EnrollmentRepositoryInterface::class, EnrollmentRepository::class);
        
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
