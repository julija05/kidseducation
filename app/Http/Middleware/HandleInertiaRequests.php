<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
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
        $user = $request->user();
        $pendingProposalsCount = 0;
        $programProposalsCount = 0;

        // Get pending proposals count for admin users
        if ($user && $user->hasRole('admin')) {
            $pendingProposalsCount = \App\Models\ResourceProposal::where('status', \App\Constants\ProposalStatus::PENDING)->count();

            // Get programs needing review count (both initial and final review)
            $programProposalsCount = \App\Models\Program::needingReview()->count();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at,
                    'roles' => $user->roles->pluck('name'),
                    'language_preference' => $user->language_preference,
                    'language_selected' => $user->language_selected,
                    'created_at' => $user->created_at,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'avatar_path' => $user->avatar_path,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'locale' => [
                'current' => App::getLocale(),
                'supported' => config('app.supported_locales'),
                'translations' => $this->getTranslations(),
            ],
            // Share CSRF token to prevent 412 errors
            'csrf_token' => fn () => csrf_token(),
            // Share pending proposals count for admin users
            'pendingProposalsCount' => $pendingProposalsCount,
            // Share program proposals needing review count for admin users
            'programProposalsCount' => $programProposalsCount,
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
