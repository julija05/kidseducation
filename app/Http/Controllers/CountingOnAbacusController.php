<?php

namespace App\Http\Controllers;

class CountingOnAbacusController extends Controller
{
    public function index()
    {
        return $this->createView('CountingOnAbacus/Index');
    }
}
