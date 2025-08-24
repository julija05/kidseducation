#!/bin/bash

# Fix Server 500 and Ziggy Errors Script
echo "🔧 Fixing server 500 and Ziggy errors..."

# Step 1: Clear all caches thoroughly
echo "🧹 Clearing all caches..."
php artisan config:clear
php artisan route:clear  
php artisan view:clear
php artisan cache:clear
php artisan event:clear

# Step 2: Ensure database tables exist
echo "🗄️  Checking database tables..."
php artisan migrate --force

# Step 3: Generate Ziggy routes (this is critical!)
echo "🛣️  Generating Ziggy routes..."
php artisan ziggy:generate

# Step 4: Build frontend assets (important for production)
echo "🏗️  Building frontend assets..."
npm run build

# Step 5: Cache everything for production
echo "⚡ Caching for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Step 6: Ensure storage link exists
echo "🔗 Ensuring storage link..."
php artisan storage:link

# Step 7: Set permissions
echo "🔒 Setting permissions..."
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/

# If www-data exists, set ownership
if id "www-data" >/dev/null 2>&1; then
    chown -R www-data:www-data storage/
    chown -R www-data:www-data bootstrap/cache/
fi

# Step 8: Test database connection
echo "✅ Testing database connection..."
if php artisan migrate:status >/dev/null 2>&1; then
    echo "✅ Database OK"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Step 9: Verify Ziggy file exists
if [ -f "public/js/ziggy.js" ]; then
    echo "✅ Ziggy routes file exists"
else
    echo "❌ Ziggy routes file missing - regenerating..."
    php artisan ziggy:generate
fi

echo ""
echo "🎉 Server fix completed!"
echo ""
echo "Next steps:"
echo "1. Check if admin dashboard works now"
echo "2. If still 500 error, use DEBUG_SERVER.env temporarily to see error details"
echo "3. Check server error logs for more information"