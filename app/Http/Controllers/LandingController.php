<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;

class LandingController extends Controller
{
    public function index()
    {
        return $this->createView('Front/Home/Home', [
            'canLogin' => Route::has('login'),
            // 'canRegister' => Route::has('register'),
        ]);
    }
}
