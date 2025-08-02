<?php

// Simple script to check translation data
require_once 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as DB;

// Database configuration - update with your settings
$database = new DB;
$database->addConnection([
    'driver' => 'mysql',
    'host' => '127.0.0.1',
    'port' => '3306',
    'database' => 'kids_education',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
]);

$database->setAsGlobal();
$database->bootEloquent();

echo "=== CHECKING TRANSLATION DATA ===\n\n";

try {
    // Check if programs table has translation columns
    $columns = DB::select("PRAGMA table_info(programs)");
    $hasNameTranslations = false;
    $hasDescTranslations = false;
    
    foreach ($columns as $column) {
        if ($column->name === 'name_translations') $hasNameTranslations = true;
        if ($column->name === 'description_translations') $hasDescTranslations = true;
    }
    
    echo "Translation columns exist:\n";
    echo "- name_translations: " . ($hasNameTranslations ? 'YES' : 'NO') . "\n";
    echo "- description_translations: " . ($hasDescTranslations ? 'YES' : 'NO') . "\n\n";
    
    // Check program data
    $programs = DB::table('programs')->get();
    echo "Programs in database:\n";
    foreach ($programs as $program) {
        echo "- {$program->name}\n";
        if (isset($program->name_translations)) {
            echo "  name_translations: {$program->name_translations}\n";
        }
        if (isset($program->description_translations)) {
            echo "  description_translations: " . (strlen($program->description_translations) > 100 ? substr($program->description_translations, 0, 100) . '...' : $program->description_translations) . "\n";
        }
        echo "\n";
    }
    
    // Check users
    echo "Users and language preferences:\n";
    $users = DB::table('users')->get();
    foreach ($users as $user) {
        echo "- {$user->name} ({$user->email})\n";
        echo "  language_preference: " . ($user->language_preference ?? 'NULL') . "\n";
        echo "  language_selected: " . ($user->language_selected ? 'true' : 'false') . "\n\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}