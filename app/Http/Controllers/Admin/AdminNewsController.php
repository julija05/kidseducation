<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\StoreNewsRequest;
use App\Http\Requests\UpdateNewsRequest;
use App\Models\News;
use Illuminate\Support\Facades\Storage;

class AdminNewsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $news = News::latest()->paginate(5);;
        return $this->createView("Admin/News/Index", ['news' => $news]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return $this->createView("Admin/News/Create");
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreNewsRequest $request)
    {
        $news = $request->all();

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('news', 'public');
            $news['image'] = "/storage/{$imagePath}";
        }

        News::create($news);

        return redirect()->route('admin.news.index')->with('success', 'News post created successfully.');
    }
    /**
     * Display the specified resource.
     */
    public function show(News $news)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(News $news)
    {
        return $this->createView("Admin/News/Edit", [
            'news' => $news
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateNewsRequest $request, News $news)
    {
        $data = $request->all();
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($news->image) {
                $oldPath = str_replace(asset('storage') . '/', '', $news->image);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('news', 'public');
            $data['image'] = asset('storage/' . $path);
        }
        $news->update($data);

        return redirect()->route('admin.news.index')->with('success', 'News updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(News $news)
    {
        if ($news->image) {
            $path = str_replace(asset('storage') . '/', '', $news->image);
            Storage::disk('public')->delete($path);
        }

        $news->delete();

        return redirect()->route('admin.news.index')->with('deleted', 'News deleted successfully.');
    }
}
