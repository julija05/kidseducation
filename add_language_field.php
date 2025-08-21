<?php

/**
 * Standalone script to add language field to lesson_resources table
 * Run this with: php add_language_field.php
 */

// Database configuration - update these values to match your setup
$host = 'mysql';  // or 'localhost' if not using Docker
$dbname = 'laravel';
$username = 'sail';
$password = 'password';
$port = 3306;

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connected to database successfully.\n";

    // Check if language column already exists
    $checkSql = "SELECT COUNT(*) FROM information_schema.COLUMNS 
                 WHERE TABLE_SCHEMA = '$dbname' 
                 AND TABLE_NAME = 'lesson_resources' 
                 AND COLUMN_NAME = 'language'";

    $result = $pdo->query($checkSql)->fetchColumn();

    if ($result > 0) {
        echo "Language column already exists in lesson_resources table.\n";
    } else {
        // Add language column
        $alterSql = "ALTER TABLE lesson_resources 
                     ADD COLUMN language VARCHAR(5) NOT NULL DEFAULT 'en' 
                     AFTER type";

        $pdo->exec($alterSql);
        echo "Added language column to lesson_resources table.\n";

        // Add index
        $indexSql = 'CREATE INDEX idx_lesson_resources_lesson_id_language 
                     ON lesson_resources(lesson_id, language)';

        $pdo->exec($indexSql);
        echo "Added index for lesson_id and language.\n";

        // Update existing records
        $updateSql = "UPDATE lesson_resources SET language = 'en' WHERE language = ''";
        $updated = $pdo->exec($updateSql);
        echo "Updated $updated existing records to have English as default language.\n";
    }

    // Show current table structure
    $describeSql = 'DESCRIBE lesson_resources';
    $columns = $pdo->query($describeSql);

    echo "\nCurrent lesson_resources table structure:\n";
    echo str_pad('Field', 20).str_pad('Type', 20).str_pad('Null', 8).str_pad('Key', 8)."Default\n";
    echo str_repeat('-', 70)."\n";

    while ($column = $columns->fetch(PDO::FETCH_ASSOC)) {
        echo str_pad($column['Field'], 20).
             str_pad($column['Type'], 20).
             str_pad($column['Null'], 8).
             str_pad($column['Key'], 8).
             $column['Default']."\n";
    }

    echo "\nLanguage field has been successfully added!\n";
    echo "You can now upload resources in different languages.\n";

} catch (PDOException $e) {
    echo 'Error: '.$e->getMessage()."\n";
    echo "\nIf you're using Docker Sail, try running:\n";
    echo "docker exec -it your-app-container php add_language_field.php\n";
    echo "\nOr connect to your database directly and run the SQL commands in add_language_field.sql\n";
}
