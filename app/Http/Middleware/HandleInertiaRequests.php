<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'roles' => $request->user()->roles->pluck('name'),
                    'language_preference' => $request->user()->language_preference,
                    'language_selected' => $request->user()->language_selected,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],
            'locale' => [
                'current' => App::getLocale(),
                'supported' => config('app.supported_locales'),
                'translations' => $this->getTranslations(),
            ],
        ];
    }

    /**
     * Get translations for the current locale
     */
    private function getTranslations(): array
    {
        $locale = App::getLocale();
        $translationPath = lang_path("{$locale}/app.php");
        
        if (file_exists($translationPath)) {
            return include $translationPath;
        }
        
        return [];
    }
}
