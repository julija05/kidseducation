<?php

namespace App\Providers;

use App\Repositories\Contracts\NewsRepositoryInterface;
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

        // You can add more repository bindings here as your application grows
        // $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        // $this->app->bind(ProductRepositoryInterface::class, ProductRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
