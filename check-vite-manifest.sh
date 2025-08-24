#!/bin/bash

# Check Vite Manifest and Build Status
echo "🔍 Checking Vite build status..."

echo ""
echo "📂 Checking build directory:"
if [ -d "public/build" ]; then
    echo "✅ public/build directory exists"
    echo "   Size: $(du -sh public/build/ | cut -f1)"
    echo "   Files: $(find public/build -type f | wc -l) files"
else
    echo "❌ public/build directory missing - need to run build"
fi

echo ""
echo "📄 Checking Vite manifest:"
if [ -f "public/build/.vite/manifest.json" ]; then
    echo "✅ Vite manifest exists"
    echo ""
    echo "🔍 Looking for AdminDashboard in manifest:"
    if grep -q "AdminDashboard" public/build/.vite/manifest.json; then
        echo "✅ AdminDashboard found in manifest"
        echo "   Entries containing 'AdminDashboard':"
        grep -n "AdminDashboard" public/build/.vite/manifest.json
    else
        echo "❌ AdminDashboard NOT found in manifest"
        echo "   This is the problem! Need to rebuild assets."
    fi
    
    echo ""
    echo "📝 All manifest entries:"
    cat public/build/.vite/manifest.json | python3 -m json.tool 2>/dev/null || cat public/build/.vite/manifest.json
    
else
    echo "❌ Vite manifest missing"
fi

echo ""
echo "🛣️  Checking Ziggy routes:"
if [ -f "public/js/ziggy.js" ]; then
    echo "✅ Ziggy routes file exists"
else
    echo "❌ Ziggy routes file missing - run: php artisan ziggy:generate"
fi

echo ""
echo "📊 Laravel cache status:"
echo "Config cached: $([ -f "bootstrap/cache/config.php" ] && echo "Yes" || echo "No")"
echo "Routes cached: $([ -f "bootstrap/cache/routes-v7.php" ] && echo "Yes" || echo "No")"
echo "Views cached: $(find storage/framework/views -name "*.php" | wc -l) compiled views"

echo ""
echo "🔧 Quick fix commands:"
echo "1. To rebuild assets: ./build-production-assets.sh"
echo "2. To just build: npm run build"
echo "3. To generate routes: php artisan ziggy:generate"
echo "4. To clear caches: php artisan config:clear && php artisan cache:clear"