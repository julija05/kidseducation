<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CountingOnAbacusController extends Controller
{
    public function index()
    {
        return $this->createView('CountingOnAbacus/Index');
    }
}
