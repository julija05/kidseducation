<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNewsRequest;
use App\Http\Requests\UpdateNewsRequest;
use App\Models\News;
use App\Services\NewsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AdminArticleController extends Controller
{
    public function __construct(
        protected NewsService $newsService
    ) {}

    /**
     * Display a listing of articles (platform guides and tutorials).
     */
    public function index(Request $request)
    {
        $category = $request->get('category', 'how_to_use');
        
        try {
            // Try to use category-based filtering if migration has been applied
            $articles = News::byCategory($category)
                ->latest('published_at')
                ->paginate(10);
        } catch (\Exception $e) {
            // Fallback: if migration hasn't been applied, show all news
            $articles = News::latest('created_at')->paginate(10);
        }
            
        return $this->createView("Admin/Articles/Index", [
            'articles' => $articles,
            'currentCategory' => $category,
            'categories' => $this->getArticleCategories(),
            'migrationRequired' => $this->checkMigrationRequired()
        ]);
    }

    /**
     * Show the form for creating a new article.
     */
    public function create(Request $request)
    {
        $category = $request->get('category', 'how_to_use');
        
        return $this->createView("Admin/Articles/Create", [
            'categories' => $this->getArticleCategories(),
            'selectedCategory' => $category,
            'migrationRequired' => $this->checkMigrationRequired()
        ]);
    }

    /**
     * Store a newly created article.
     */
    public function store(StoreNewsRequest $request): RedirectResponse
    {
        try {
            // Check if migration has been applied
            if ($this->checkMigrationRequired()) {
                // Migration required - create basic news item without category fields
                $data = [
                    'title' => $request->title,
                    'content' => $request->content,
                ];
                
                if ($request->hasFile('image')) {
                    // Handle image upload manually since service might expect category fields
                    $imagePath = $request->file('image')->store('news', 'public');
                    $data['image'] = '/storage/' . $imagePath;
                }
                
                News::create($data);
                
                return redirect()
                    ->route('admin.articles.index')
                    ->with('success', 'Article created successfully. Database migration required for full functionality.');
            } else {
                $this->newsService->createNews($request);
                
                $categoryName = News::CATEGORIES[$request->category] ?? 'Article';
                
                return redirect()
                    ->route('admin.articles.index', ['category' => $request->category])
                    ->with('success', "{$categoryName} created successfully.");
            }
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to create article. Please try again.');
        }
    }

    /**
     * Display the specified article.
     */
    public function show($id)
    {
        $article = News::where('id', $id)->firstOrFail();
        return $this->createView("Admin/Articles/Show", ['article' => $article]);
    }

    /**
     * Show the form for editing the specified article.
     */
    public function edit($id)
    {
        $article = News::where('id', $id)->firstOrFail();
        return $this->createView("Admin/Articles/Edit", [
            'article' => $article,
            'categories' => $this->getArticleCategories(),
            'migrationRequired' => $this->checkMigrationRequired()
        ]);
    }

    /**
     * Update the specified article.
     */
    public function update(UpdateNewsRequest $request, $id): RedirectResponse
    {
        try {
            $article = News::where('id', $id)->firstOrFail();
            $this->newsService->updateNews($request, $article);
            
            $categoryName = News::CATEGORIES[$request->category] ?? 'Article';
            
            return redirect()
                ->route('admin.articles.index', ['category' => $request->category])
                ->with('success', "{$categoryName} updated successfully.");
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to update article. Please try again.');
        }
    }

    /**
     * Remove the specified article.
     */
    public function destroy($id): RedirectResponse
    {
        try {
            $article = News::where('id', $id)->firstOrFail();
            $category = $article->category;
            $this->newsService->deleteNews($article);
            
            return redirect()
                ->route('admin.articles.index', ['category' => $category])
                ->with('success', 'Article deleted successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to delete article. Please try again.');
        }
    }

    /**
     * Get article-specific categories (excluding regular news).
     */
    private function getArticleCategories(): array
    {
        return array_filter(News::CATEGORIES, function ($key) {
            return $key !== 'news';
        }, ARRAY_FILTER_USE_KEY);
    }

    /**
     * Check if the database migration is required.
     */
    private function checkMigrationRequired(): bool
    {
        try {
            // Try to access the category column
            News::select('category')->limit(1)->get();
            return false; // Migration not required
        } catch (\Exception $e) {
            return true; // Migration required
        }
    }
}