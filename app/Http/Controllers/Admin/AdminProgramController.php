<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;

class AdminProgramController extends Controller
{
    public function index()
    {
        $programs = Program::all();

        return $this->createView('Admin/Programs/AdminPrograms', [
            'programs' => $programs
        ]);
    }
}
