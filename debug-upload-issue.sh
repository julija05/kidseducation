#!/bin/bash

echo "=== DEBUG UPLOAD ISSUE ==="
echo "Checking for image: jrFiTrmKYScqfQXLtZshW4f0Gn3WdttVRp75FuWA.jpg"
echo ""

IMAGE_NAME="jrFiTrmKYScqfQXLtZshW4f0Gn3WdttVRp75FuWA.jpg"

echo "=== 1. CHECKING IF FILE EXISTS IN STORAGE ==="
if [ -f "storage/app/public/news/$IMAGE_NAME" ]; then
    echo "✓ File EXISTS in storage/app/public/news/"
    ls -la "storage/app/public/news/$IMAGE_NAME"
else
    echo "✗ File NOT FOUND in storage/app/public/news/"
    echo "Available files:"
    ls -la storage/app/public/news/
fi
echo ""

echo "=== 2. CHECKING IF FILE ACCESSIBLE VIA SYMLINK ==="
if [ -f "public/storage/news/$IMAGE_NAME" ]; then
    echo "✓ File ACCESSIBLE via public/storage/news/"
    ls -la "public/storage/news/$IMAGE_NAME"
else
    echo "✗ File NOT ACCESSIBLE via public/storage/news/"
    echo "Available files via symlink:"
    ls -la public/storage/news/ 2>/dev/null || echo "Directory not accessible"
fi
echo ""

echo "=== 3. CHECKING RECENT UPLOADS ==="
echo "Most recent files in storage/app/public/news/:"
ls -lat storage/app/public/news/ | head -5
echo ""

echo "=== 4. CHECKING WEB SERVER PROCESS ==="
echo "Web server processes:"
ps aux | grep -E "(apache|nginx|httpd)" | grep -v grep | head -3
echo ""

echo "=== 5. CHECKING DIRECTORY PERMISSIONS ==="
echo "Storage directory permissions:"
ls -ld storage/app/public/news/
echo "Public storage symlink permissions:"
ls -ld public/storage/news/ 2>/dev/null || echo "Symlink target not accessible"
echo ""

echo "=== 6. TESTING WEB ACCESS ==="
echo "Testing HTTP access:"
curl -I "https://abacoding.com/storage/news/$IMAGE_NAME" 2>/dev/null | head -3
echo ""

echo "=== 7. CHECKING LARAVEL LOGS ==="
echo "Recent Laravel logs:"
if [ -f "storage/logs/laravel.log" ]; then
    tail -10 storage/logs/laravel.log
else
    echo "No Laravel log file found"
fi
echo ""

echo "=== 8. CHECKING HTACCESS ==="
echo "Checking .htaccess for storage rules:"
if [ -f "public/.htaccess" ]; then
    grep -n -A3 -B3 -i storage public/.htaccess || echo "No storage rules found"
else
    echo "No .htaccess file found"
fi
echo ""

echo "=== 9. MANUAL UPLOAD TEST ==="
echo "Creating test file to verify upload path:"
echo "test content" > storage/app/public/news/test-upload.txt
if [ -f "public/storage/news/test-upload.txt" ]; then
    echo "✓ Test file accessible via symlink"
    rm storage/app/public/news/test-upload.txt
else
    echo "✗ Test file NOT accessible via symlink"
fi
echo ""

echo "=== DEBUG COMPLETE ==="
echo ""
echo "If file exists in storage but not accessible via symlink:"
echo "  - Check symlink integrity: ls -la public/storage"
echo "  - Check web server user permissions"
echo "  - Try: chmod -R 755 storage/app/public/news/"
echo ""
echo "If file doesn't exist in storage:"
echo "  - Upload failed - check Laravel logs"
echo "  - Check disk space: df -h"
echo "  - Check PHP upload limits: php -i | grep upload"