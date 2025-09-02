#!/bin/bash

echo "=== SERVER STORAGE DEBUGGING SCRIPT ==="
echo "Environment: $(php artisan env 2>/dev/null || echo 'unknown')"
echo "Date: $(date)"
echo ""

echo "=== 1. CHECKING STORAGE LINK ==="
echo "Storage symlink status:"
ls -la public/storage 2>/dev/null || echo "No storage symlink found"
echo ""

echo "=== 2. CHECKING STORAGE DIRECTORIES ==="
echo "Storage app/public directory:"
ls -la storage/app/public/ 2>/dev/null || echo "Storage app/public directory not found"
echo ""
echo "Storage app/public/news directory:"
ls -la storage/app/public/news/ 2>/dev/null || echo "News directory does not exist"
echo ""

echo "=== 3. CHECKING PUBLIC DIRECTORY PERMISSIONS ==="
echo "Public directory permissions:"
ls -la public/ | grep storage 2>/dev/null || echo "No storage link in public directory"
echo ""

echo "=== 4. CHECKING WEB SERVER DOCUMENT ROOT ==="
echo "Current directory: $(pwd)"
echo "Web server document root (if Apache/Nginx is configured):"
echo "Should point to: $(pwd)/public"
echo ""

echo "=== 5. CHECKING .ENV CONFIGURATION ==="
echo "Relevant .env settings:"
grep -E "APP_URL|FILESYSTEM_DISK|AWS_" .env 2>/dev/null || echo "Could not read .env file"
echo ""

echo "=== 6. CHECKING SPECIFIC IMAGES ==="
echo "Checking some specific images from local:"
echo ""

# Check if images exist
TEST_IMAGES=(
    "lP0IAHq7yIq96eE2V7GyR1NVgbpYdKceu9XZtDwx.jpg"
    "JRifss2JeHIFlUeJq6vN8G0GdscuWLucNndLZefU.png"
    "HtGtv2T8zX2kpx6BnJ7dXOtrxUofNSt5iHgyLIZy.png"
)

for img in "${TEST_IMAGES[@]}"; do
    echo "Checking: $img"
    if [ -f "storage/app/public/news/$img" ]; then
        echo "  ✓ File exists in storage/app/public/news/"
        ls -la "storage/app/public/news/$img"
    else
        echo "  ✗ File NOT found in storage/app/public/news/"
    fi
    
    if [ -f "public/storage/news/$img" ]; then
        echo "  ✓ File accessible via public/storage/news/"
        ls -la "public/storage/news/$img"
    else
        echo "  ✗ File NOT accessible via public/storage/news/"
    fi
    echo "---"
done

echo ""
echo "=== 7. TESTING HTTP ACCESS (if possible) ==="
if command -v curl &> /dev/null; then
    echo "Testing HTTP access with curl:"
    for img in "${TEST_IMAGES[@]}"; do
        echo "Testing: http://yourdomain.com/storage/news/$img"
        curl -I "http://localhost/storage/news/$img" 2>/dev/null | head -n 1 || echo "Could not test HTTP access"
        echo "---"
    done
else
    echo "curl not available for HTTP testing"
fi

echo ""
echo "=== 8. DIRECTORY OWNERSHIP AND PERMISSIONS ==="
echo "Storage directory ownership:"
ls -ld storage/ storage/app/ storage/app/public/ storage/app/public/news/ 2>/dev/null || echo "Some directories not found"
echo ""
echo "Public directory ownership:"
ls -ld public/ public/storage 2>/dev/null || echo "Some directories not found"
echo ""

echo "=== SERVER DEBUGGING COMPLETE ==="
echo ""
echo "NEXT STEPS:"
echo "1. Compare this output with your local environment"
echo "2. Ensure storage symlink exists: php artisan storage:link"
echo "3. Check web server document root points to /path/to/project/public"
echo "4. Verify file permissions allow web server to read files"
echo "5. Check that your domain/URL correctly serves files from /storage/ path"