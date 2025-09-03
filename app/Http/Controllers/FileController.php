<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class FileController extends Controller
{
    public function serve($path)
    {
        // Example: serve files from "public" disk
        if (!Storage::disk('public')->exists($path)) {
            abort(404);
        }

        // You could add permission checks here if needed
        // $this->authorize('view', $fileModel);

        return Storage::disk('public')->response($path);
    }
}
