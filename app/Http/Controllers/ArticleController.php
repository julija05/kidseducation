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
        
        try {
            $articles = News::published()
                ->byCategory($category)
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
            'categoryName' => News::CATEGORIES[$category] ?? 'Articles'
        ]);
    }

    /**
     * Display the specified article.
     */
    public function show(Request $request, $slug)
    {
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
        
        try {
            $relatedArticles = News::published()
                ->byCategory($article->category)
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
            'relatedArticles' => $relatedArticles
        ]);
    }

    /**
     * Get categories available for public viewing (excluding regular news).
     */
    private function getPublicCategories(): array
    {
        return array_filter(News::CATEGORIES, function ($key) {
            return $key !== 'news';
        }, ARRAY_FILTER_USE_KEY);
    }
}