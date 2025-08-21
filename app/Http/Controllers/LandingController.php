<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Route;

class LandingController extends Controller
{
    public function index()
    {
        return $this->createView('Front/Home/Home', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }
}
