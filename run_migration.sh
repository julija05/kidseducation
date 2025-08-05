#!/bin/bash

echo "🔧 Adding language field to lesson_resources table..."

# Check if we're in a Sail environment
if [ -f "./vendor/bin/sail" ]; then
    echo "📦 Detected Laravel Sail environment"
    echo "🚀 Running migration with Sail..."
    ./vendor/bin/sail artisan migrate --path=database/migrations/2025_08_04_000001_add_language_to_lesson_resources_table.php
elif command -v php >/dev/null 2>&1; then
    echo "🐘 Detected PHP installation"
    echo "🚀 Running migration with PHP..."
    php artisan migrate --path=database/migrations/2025_08_04_000001_add_language_to_lesson_resources_table.php
else
    echo "❌ Neither Sail nor PHP detected"
    echo "📝 Please run one of these commands manually:"
    echo ""
    echo "For Sail:"
    echo "./vendor/bin/sail artisan migrate --path=database/migrations/2025_08_04_000001_add_language_to_lesson_resources_table.php"
    echo ""
    echo "For PHP:"
    echo "php artisan migrate --path=database/migrations/2025_08_04_000001_add_language_to_lesson_resources_table.php"
    echo ""
    echo "Or run the PHP script:"
    echo "php add_language_field.php"
    exit 1
fi

echo "✅ Migration completed!"
echo "🎯 You can now upload Macedonian resources!"