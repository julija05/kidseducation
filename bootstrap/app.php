<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\SetLocale::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\EnsureDemoAccess::class,
            \App\Http\Middleware\CacheHeaders::class,
        ]);
        
        // Exclude chat routes from CSRF verification (for guest users and admin)
        $middleware->validateCsrfTokens(except: [
            'chat/*',
            'admin/chat/*',
        ]);
        
        $middleware->alias([
            'auth' => \App\Http\Middleware\HandleAuthentication::class,
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
            'admin.english' => \App\Http\Middleware\ForceEnglishForAdmin::class,
            'cache' => \App\Http\Middleware\CacheHeaders::class,
        ]);
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Helper function to get user's preferred locale for error pages
        // Uses same logic as SetLocale middleware for consistency
        $getUserLocale = function (Request $request) {
            $locale = null;
            $urlLocale = $request->get('locale');
            $sessionLocale = $request->hasSession() ? Session::get('locale') : null;
            $configLocale = config('app.locale');
            
            // Priority 1: URL parameter (for explicit language switching)
            if ($urlLocale && in_array($urlLocale, config('app.supported_locales', ['en', 'mk']))) {
                $locale = $urlLocale;
                
                // Update authenticated user's preference for consistency
                if (Auth::check() && Auth::user()->language_preference !== $urlLocale) {
                    Auth::user()->update(['language_preference' => $urlLocale]);
                }
            }
            // Priority 2: Authenticated user's saved preference
            elseif (Auth::check() && Auth::user()->language_preference) {
                $locale = Auth::user()->language_preference;
            }
            // Priority 3: Session locale (for guest users)
            elseif ($sessionLocale) {
                $locale = $sessionLocale;
            }
            // Priority 4: Default config locale
            else {
                $locale = $configLocale;
            }
            
            // Validate locale
            if (!in_array($locale, config('app.supported_locales', ['en', 'mk']))) {
                $locale = config('app.locale');
            }
            
            return $locale;
        };
        
        // Helper function to get translations for a specific locale
        $getTranslations = function ($locale) {
            $translationPath = lang_path("{$locale}/app.php");
            return file_exists($translationPath) ? include $translationPath : [];
        };
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, Request $request) use ($getUserLocale, $getTranslations) {
            if ($request->wantsJson()) {
                return null; // Let Laravel handle JSON responses
            }
            
            // Show custom 404 page when custom error pages are enabled
            if (config('app.custom_error_pages', true)) {
                // Get user's preferred locale and translations
                $locale = $getUserLocale($request);
                $translations = $getTranslations($locale);
                
                // Set the app locale for this request to ensure consistent language
                app()->setLocale($locale);
                
                return Inertia::render('Errors/404', [
                    'status' => 404,
                    'locale' => [
                        'current' => $locale,
                        'supported' => config('app.supported_locales'),
                        'translations' => $translations,
                    ]
                ])->toResponse($request)->setStatusCode(404);
            }
            
            return null;
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException $e, Request $request) use ($getUserLocale, $getTranslations) {
            if ($request->wantsJson()) {
                return null; // Let Laravel handle JSON responses
            }
            
            // Show custom 403 page when custom error pages are enabled
            if (config('app.custom_error_pages', true)) {
                // Get user's preferred locale and translations
                $locale = $getUserLocale($request);
                $translations = $getTranslations($locale);
                
                // Set the app locale for this request to ensure consistent language
                app()->setLocale($locale);
                
                return Inertia::render('Errors/403', [
                    'status' => 403,
                    'locale' => [
                        'current' => $locale,
                        'supported' => config('app.supported_locales'),
                        'translations' => $translations,
                    ]
                ])->toResponse($request)->setStatusCode(403);
            }
            
            return null;
        });

        // Handle authentication exceptions (session expiration)
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            Log::info('Authentication exception caught', [
                'url' => $request->url(),
                'method' => $request->method(),
                'session_exists' => $request->hasSession(),
                'session_id' => $request->hasSession() ? $request->session()->getId() : null,
                'is_inertia' => $request->header('X-Inertia'),
                'expects_json' => $request->expectsJson(),
            ]);

            // For Inertia requests, return 401 to trigger client-side redirect
            if ($request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                    'redirect' => route('login')
                ], 401);
            }

            // For regular requests, redirect to login
            return redirect()->guest(route('login'));
        });

        $exceptions->render(function (\Throwable $e, Request $request) use ($getUserLocale, $getTranslations) {
            // Handle 500 and other server errors
            if ($request->wantsJson()) {
                return null; // Let Laravel handle JSON responses
            }

            // Only handle these as custom error pages in production or when explicitly enabled
            if (app()->environment('production') || config('app.custom_error_pages', true)) {
                $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
                
                if ($status >= 500) {
                    // Get user's preferred locale and translations
                    $locale = $getUserLocale($request);
                    $translations = $getTranslations($locale);
                    
                    // Set the app locale for this request to ensure consistent language
                    app()->setLocale($locale);
                    
                    return Inertia::render('Errors/500', [
                        'status' => $status,
                        'locale' => [
                            'current' => $locale,
                            'supported' => config('app.supported_locales'),
                            'translations' => $translations,
                        ]
                    ])->toResponse($request)->setStatusCode($status);
                }
            }

            return null; // Let Laravel handle other errors
        });
    })->create();
