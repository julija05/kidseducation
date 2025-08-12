<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class HelpController extends Controller
{
    /**
     * Display the Help & Guides main page.
     */
    public function index()
    {
        return Inertia::render('Help/Index');
    }

    /**
     * Display a specific help article.
     */
    public function show($slug)
    {
        // This would typically fetch article data from database
        // For now, we'll return a placeholder
        return Inertia::render('Help/Article', [
            'article' => [
                'title' => 'Help Article',
                'slug' => $slug,
                'content' => 'Article content would go here...',
            ]
        ]);
    }

    /**
     * Search help articles.
     */
    public function search(Request $request)
    {
        $query = $request->get('q');
        
        // This would typically search articles in database
        $results = [
            // Mock search results
            [
                'title' => 'Getting Started with Abacoding',
                'excerpt' => 'Learn how to create your account and get started...',
                'url' => route('help.article', 'getting-started'),
                'category' => 'Getting Started'
            ],
            // Add more mock results as needed
        ];

        return response()->json([
            'results' => $results,
            'query' => $query
        ]);
    }
}