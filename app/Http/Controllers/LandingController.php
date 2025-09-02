<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Support\Facades\Route;

class LandingController extends Controller
{
    public function index()
    {
        $articles = News::published()
            ->latest('published_at')
            ->take(6)
            ->get();


        return $this->createView('Front/Home/Home', [
            'canLogin' => Route::has('login'),
            'articles' => $articles,
            // 'canRegister' => Route::has('register'),
        ]);
    }
}
