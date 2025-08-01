<?php

// Add this temporarily to your routes/web.php file to debug translations

use Illuminate\Support\Facades\Route;
use App\Models\Program;
use App\Models\User;

Route::get('/debug-translations', function () {
    echo "<h1>Translation Debug</h1>";
    
    // Check current user and locale
    $user = auth()->user();
    echo "<h2>Current User & Locale</h2>";
    if ($user) {
        echo "<p>User: {$user->name} ({$user->email})</p>";
        echo "<p>Language Preference: " . ($user->language_preference ?? 'NULL') . "</p>";
        echo "<p>Language Selected: " . ($user->language_selected ? 'true' : 'false') . "</p>";
    } else {
        echo "<p>No authenticated user</p>";
    }
    echo "<p>Current App Locale: " . app()->getLocale() . "</p>";
    echo "<p>Supported Locales: " . json_encode(config('app.supported_locales')) . "</p>";
    
    // Check program translations
    echo "<h2>Program Translation Data</h2>";
    $programs = Program::all();
    foreach ($programs as $program) {
        echo "<h3>Program: {$program->name}</h3>";
        echo "<p>Original name: {$program->name}</p>";
        echo "<p>Original description: " . substr($program->description, 0, 100) . "...</p>";
        echo "<p>Name translations: " . json_encode($program->name_translations) . "</p>";
        echo "<p>Description translations: " . json_encode($program->description_translations ? array_map(fn($desc) => substr($desc, 0, 50) . '...', $program->description_translations) : null) . "</p>";
        
        // Test translated attributes
        try {
            echo "<p>Translated name (current locale): " . ($program->translated_name ?? 'NULL') . "</p>";
            echo "<p>Translated description (current locale): " . (substr($program->translated_description ?? '', 0, 50) . '...') . "</p>";
        } catch (Exception $e) {
            echo "<p style='color: red;'>Error getting translated attributes: " . $e->getMessage() . "</p>";
        }
        
        echo "<hr>";
    }
    
    return null;
});