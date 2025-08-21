<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNewsRequest;
use App\Http\Requests\UpdateNewsRequest;
use App\Models\News;
use App\Services\NewsService;
use Illuminate\Http\RedirectResponse;

class AdminNewsController extends Controller
{
    public function __construct(
        protected NewsService $newsService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $news = $this->newsService->getPaginatedNews(5);

        return $this->createView('Admin/News/Index', ['news' => $news]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return $this->createView('Admin/News/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreNewsRequest $request): RedirectResponse
    {
        try {
            $this->newsService->createNews($request);

            return redirect()
                ->route('admin.news.index')
                ->with('success', 'News post created successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to create news post. Please try again.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(News $news)
    {
        return $this->createView('Admin/News/Show', ['news' => $news]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(News $news)
    {
        return $this->createView('Admin/News/Edit', ['news' => $news]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateNewsRequest $request, News $news): RedirectResponse
    {
        try {
            $this->newsService->updateNews($request, $news);

            return redirect()
                ->route('admin.news.index')
                ->with('success', 'News updated successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to update news post. Please try again.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(News $news): RedirectResponse
    {
        try {
            $this->newsService->deleteNews($news);

            return redirect()
                ->route('admin.news.index')
                ->with('success', 'News deleted successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to delete news post. Please try again.');
        }
    }
}
