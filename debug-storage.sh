#!/bin/bash

echo "=== STORAGE DEBUGGING SCRIPT ==="
echo "Environment: $(php artisan env)"
echo "Date: $(date)"
echo ""

echo "=== 1. CHECKING STORAGE LINK ==="
echo "Storage symlink status:"
ls -la public/storage
echo ""

echo "=== 2. CHECKING STORAGE DIRECTORIES ==="
echo "Storage app/public directory:"
ls -la storage/app/public/
echo ""
echo "Storage app/public/news directory:"
ls -la storage/app/public/news/ 2>/dev/null || echo "News directory does not exist"
echo ""

echo "=== 3. CHECKING PUBLIC DIRECTORY PERMISSIONS ==="
echo "Public directory permissions:"
ls -la public/ | grep storage
echo ""

echo "=== 4. CHECKING STORAGE PATH IN LARAVEL ==="
echo "Laravel storage paths:"
php artisan tinker --execute="
echo 'Storage path: ' . storage_path() . PHP_EOL;
echo 'Public path: ' . public_path() . PHP_EOL;
echo 'Storage public disk path: ' . storage_path('app/public') . PHP_EOL;
echo 'Asset URL: ' . asset('storage/test.jpg') . PHP_EOL;
echo 'Storage URL: ' . \Storage::disk('public')->url('test.jpg') . PHP_EOL;
"
echo ""

echo "=== 5. CHECKING ARTICLES WITH IMAGES ==="
php artisan tinker --execute="
\$articles = \App\Models\News::whereNotNull('image')->get(['id', 'title', 'image']);
echo 'Articles with images:' . PHP_EOL;
foreach(\$articles as \$article) {
    echo 'ID: ' . \$article->id . ' | Title: ' . \$article->title . ' | Image: ' . \$article->image . PHP_EOL;
    \$filePath = public_path('storage/news/' . basename(\$article->image));
    echo 'File exists at ' . \$filePath . ': ' . (file_exists(\$filePath) ? 'YES' : 'NO') . PHP_EOL;
    echo '---' . PHP_EOL;
}
"
echo ""

echo "=== 6. TESTING WEB ACCESS TO IMAGES ==="
echo "Testing HTTP access (if curl is available):"
if command -v curl &> /dev/null; then
    # Get first image from database
    IMAGE_PATH=$(php artisan tinker --execute="echo \App\Models\News::whereNotNull('image')->first()->image ?? '/storage/news/test.jpg';" 2>/dev/null)
    if [ ! -z "$IMAGE_PATH" ]; then
        FULL_URL="http://localhost$IMAGE_PATH"
        echo "Testing URL: $FULL_URL"
        curl -I "$FULL_URL" 2>/dev/null || echo "Could not test HTTP access"
    else
        echo "No images found in database to test"
    fi
else
    echo "curl not available for HTTP testing"
fi
echo ""

echo "=== 7. CHECKING .ENV CONFIGURATION ==="
echo "Relevant .env settings:"
grep -E "APP_URL|FILESYSTEM_DISK|AWS_" .env 2>/dev/null || echo "Could not read .env file"
echo ""

echo "=== 8. CHECKING FILESYSTEM CONFIG ==="
echo "Default filesystem disk:"
php artisan tinker --execute="echo config('filesystems.default');"
echo ""

echo "=== DEBUGGING COMPLETE ==="