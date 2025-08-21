<?php

namespace App\Providers;

use App\Repositories\Interfaces\ProgramRepositoryInterface;
use App\Repositories\ProgramRepository;
use App\Services\ImageService;
use App\Services\ProgramService;
use Illuminate\Support\ServiceProvider;

class ProgramServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Dependency Inversion Principle: Bind interface to implementation
        $this->app->bind(ProgramRepositoryInterface::class, ProgramRepository::class);

        // Register services as singletons for better performance
        $this->app->singleton(ImageService::class, function ($app) {
            return new ImageService('programs');
        });

        $this->app->singleton(ProgramService::class, function ($app) {
            return new ProgramService(
                $app->make(ProgramRepositoryInterface::class),
                $app->make(ImageService::class)
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
