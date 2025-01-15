<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SignUpKidController extends Controller
{
    public function index()
    {
        return $this->createView('Front/SignupKid/SignupKid');
    }
}

