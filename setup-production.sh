#!/bin/bash

# Production Server Setup Script for Abacoding Kids Education Website
# Run this script on your production server after deploying the code

echo "🚀 Starting Abacoding production setup..."

# Check if we're in the correct directory
if [ ! -f "composer.json" ]; then
    echo "❌ Error: Run this script from the Laravel project root directory"
    exit 1
fi

# Install/update dependencies
echo "📦 Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader

echo "📦 Installing NPM dependencies..."
npm ci

# Build frontend assets
echo "🏗️  Building frontend assets for production..."
npm run build

# Database setup
echo "🗄️  Setting up database..."
php artisan migrate --force

# Create necessary tables for sessions and cache
echo "🗄️  Setting up cache and session tables..."
php artisan migrate --force

# Seed database with roles and admin user
echo "🌱 Seeding database with roles and admin user..."
php artisan db:seed --force

# Clear and optimize caches
echo "🧹 Clearing all caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

echo "⚡ Optimizing for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Generate Ziggy routes for JavaScript
echo "🛣️  Generating Ziggy routes..."
php artisan ziggy:generate

# Create storage link
echo "🔗 Creating storage symlink..."
php artisan storage:link

# Set proper permissions
echo "🔒 Setting file permissions..."
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/

# Try to set ownership (if www-data user exists)
if id "www-data" >/dev/null 2>&1; then
    echo "👤 Setting ownership to www-data..."
    chown -R www-data:www-data storage/
    chown -R www-data:www-data bootstrap/cache/
else
    echo "⚠️  www-data user not found, skipping ownership change"
    echo "   Please ensure your web server user has write access to:"
    echo "   - storage/ directory"
    echo "   - bootstrap/cache/ directory"
fi

# Verify setup
echo "✅ Running setup verification..."

# Check if key directories exist and are writable
if [ -w "storage/" ] && [ -w "bootstrap/cache/" ]; then
    echo "✅ Directory permissions OK"
else
    echo "❌ Directory permissions issue - please check manually"
fi

# Check if database connection works
if php artisan migrate:status >/dev/null 2>&1; then
    echo "✅ Database connection OK"
else
    echo "❌ Database connection issue - please check .env configuration"
fi

# Check if storage link exists
if [ -L "public/storage" ]; then
    echo "✅ Storage symlink OK"
else
    echo "❌ Storage symlink issue - run 'php artisan storage:link' manually"
fi

echo ""
echo "🎉 Production setup completed!"
echo ""
echo "⚠️  Important next steps:"
echo "1. Update your .env file with production values (see PRODUCTION_ENV_TEMPLATE.env)"
echo "2. Ensure your web server is configured to serve from public/ directory"
echo "3. Set up SSL certificate for HTTPS"
echo "4. Configure your domain DNS settings"
echo "5. Test the following functionality:"
echo "   - Admin login at /admin/dashboard"
echo "   - Language switching"
echo "   - Demo functionality"
echo "   - Student registration"
echo ""
echo "📖 See SERVER_CONFIG_FIX.md for detailed configuration instructions"