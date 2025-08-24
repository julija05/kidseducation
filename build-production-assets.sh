#!/bin/bash

# Production Asset Build Script for Server
echo "🏗️  Building production assets for Abacoding..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the Laravel project root."
    exit 1
fi

# Clear previous builds and caches
echo "🧹 Clearing previous builds..."
rm -rf public/build/
rm -rf public/hot
rm -rf node_modules/.vite/

# Install fresh dependencies
echo "📦 Installing fresh Node dependencies..."
npm ci --production=false

# Clear Laravel caches
echo "🧹 Clearing Laravel caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Build for production
echo "🏗️  Building production assets..."
npm run build

# Check if build was successful
if [ -d "public/build" ]; then
    echo "✅ Build directory created successfully"
else
    echo "❌ Build failed - no build directory found"
    exit 1
fi

# Check if manifest exists
if [ -f "public/build/.vite/manifest.json" ]; then
    echo "✅ Vite manifest created successfully"
    echo "📝 Manifest contains:"
    # Show first few entries of manifest to verify AdminDashboard is included
    head -20 public/build/.vite/manifest.json
else
    echo "❌ Vite manifest missing"
    exit 1
fi

# Generate Ziggy routes
echo "🛣️  Generating Ziggy routes..."
php artisan ziggy:generate

# Cache Laravel configurations for production
echo "⚡ Caching Laravel configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set proper permissions
echo "🔒 Setting build directory permissions..."
chmod -R 755 public/build/

echo ""
echo "🎉 Production build completed successfully!"
echo ""
echo "✅ Next steps:"
echo "1. Test admin dashboard: /admin/dashboard"
echo "2. Check browser console for any remaining errors"
echo "3. If still issues, check storage/logs/laravel.log"

# Show build info
echo ""
echo "📊 Build information:"
echo "Build directory size: $(du -sh public/build/ 2>/dev/null | cut -f1 || echo 'Unknown')"
echo "Number of built files: $(find public/build -type f 2>/dev/null | wc -l || echo 'Unknown')"