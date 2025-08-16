<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class LegalController extends Controller
{
    /**
     * Display the Privacy Policy page.
     */
    public function privacy()
    {
        return Inertia::render('Legal/PrivacyPolicy');
    }

    /**
     * Display the Terms of Service page.
     */
    public function terms()
    {
        return Inertia::render('Legal/TermsOfService');
    }
}