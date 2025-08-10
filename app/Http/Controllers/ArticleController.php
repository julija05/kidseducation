<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    /**
     * Display a listing of articles by category.
     */
    public function index(Request $request)
    {
        $category = $request->get('category', 'how_to_use');
        $currentLocale = app()->getLocale();
        
        try {
            $articles = News::published()
                ->byCategory($category)
                ->withTranslation($currentLocale) // Filter by available translations
                ->latest('published_at')
                ->paginate(12);
        } catch (\Exception $e) {
            // Fallback if migration hasn't been applied yet
            $articles = News::where('title', 'LIKE', '%' . $category . '%')
                ->latest('created_at')
                ->paginate(12);
        }
            
        return $this->createView("Front/Articles/Index", [
            'articles' => $articles,
            'currentCategory' => $category,
            'categories' => $this->getPublicCategories(),
            'categoriesWithArticles' => $this->getCategoriesWithArticles($currentLocale),
            'categoryName' => $this->getCategoryTranslation($category),
            'currentLocale' => $currentLocale
        ]);
    }

    /**
     * Display the specified article.
     */
    public function show(Request $request, $slug)
    {
        $currentLocale = app()->getLocale();
        
        try {
            $article = News::where('slug', $slug)->firstOrFail();
        } catch (\Exception $e) {
            // Fallback if slug column doesn't exist yet
            $article = News::where('id', $slug)->firstOrFail();
        }

        // Check if published (only if column exists)
        try {
            if (!$article->is_published) {
                abort(404);
            }
        } catch (\Exception $e) {
            // Column doesn't exist yet, skip check
        }

        // Check if article has translation for current locale
        if (!$article->hasTranslation($currentLocale)) {
            abort(404); // Article not available in current language
        }
        
        try {
            $relatedArticles = News::published()
                ->byCategory($article->category)
                ->withTranslation($currentLocale) // Filter related articles by translation
                ->where('id', '!=', $article->id)
                ->latest('published_at')
                ->limit(3)
                ->get();
        } catch (\Exception $e) {
            // Fallback if migration hasn't been applied yet
            $relatedArticles = News::where('id', '!=', $article->id)
                ->latest('created_at')
                ->limit(3)
                ->get();
        }
            
        return $this->createView("Front/Articles/Show", [
            'article' => $article,
            'relatedArticles' => $relatedArticles,
            'currentLocale' => $currentLocale,
            'translations' => [
                'ready_to_start_learning' => __('app.ready_to_start_learning'),
                'explore_programs_description' => __('app.explore_programs_description'),
                'view_programs' => __('app.view_programs'),
                'back_to' => __('app.back_to'),
                'related_articles' => __('app.articles.related_articles'),
                'read_more' => __('app.articles.read_more')
            ]
        ]);
    }

    /**
     * Get categories available for public viewing.
     */
    private function getPublicCategories(): array
    {
        $categories = News::CATEGORIES;
        
        // Translate category names
        $translatedCategories = [];
        foreach ($categories as $key => $name) {
            $translatedCategories[$key] = $this->getCategoryTranslation($key);
        }
        
        return $translatedCategories;
    }

    /**
     * Get categories that have at least one published article with translation.
     */
    private function getCategoriesWithArticles(string $locale): array
    {
        $categoriesWithArticles = [];
        $publicCategories = $this->getPublicCategories();
        
        foreach ($publicCategories as $key => $name) {
            try {
                $hasArticles = News::published()
                    ->byCategory($key)
                    ->withTranslation($locale)
                    ->exists();
                    
                if ($hasArticles) {
                    $categoriesWithArticles[$key] = $this->getCategoryTranslation($key);
                }
            } catch (\Exception $e) {
                // Fallback if migration hasn't been applied yet
                $hasArticles = News::where('title', 'LIKE', '%' . str_replace('_', ' ', $key) . '%')
                    ->exists();
                    
                if ($hasArticles) {
                    $categoriesWithArticles[$key] = $this->getCategoryTranslation($key);
                }
            }
        }
        
        return $categoriesWithArticles;
    }

    /**
     * Get translated category name.
     */
    private function getCategoryTranslation(string $category): string
    {
        $keyMap = [
            'how_to_use' => 'how_to_use_platform',
            'tutorials' => 'tutorials_guides',
            'updates' => 'platform_updates',
            'news' => 'news_announcements'
        ];
        
        $key = $keyMap[$category] ?? null;
        if ($key) {
            $translation = __("app.articles.{$key}");
            // If translation key is returned literally, fall back to hardcoded value
            if ($translation === "app.articles.{$key}") {
                return News::CATEGORIES[$category] ?? ucfirst(str_replace('_', ' ', $category));
            }
            return $translation;
        }
        
        // Fallback to the hardcoded value if translation key doesn't exist
        return News::CATEGORIES[$category] ?? 'Articles';
    }
}