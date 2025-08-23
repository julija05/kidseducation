#!/bin/bash

# Secure Credential Generator for Abacoding Production
# Run this script to generate secure credentials for production

echo "🔒 Abacoding - Secure Credential Generator"
echo "=========================================="
echo ""

# Generate secure admin password
ADMIN_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=' | head -c 24)

# Generate APP_KEY
APP_KEY="base64:$(openssl rand -base64 32)"

# Generate database password
DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 20)

echo "✅ Generated secure credentials:"
echo ""
echo "📧 Admin Credentials:"
echo "ADMIN_EMAIL=admin@abacoding.com"
echo "ADMIN_NAME=\"Abacoding Admin\""
echo "ADMIN_PASSWORD=$ADMIN_PASSWORD"
echo ""
echo "🔑 Application Key:"
echo "APP_KEY=$APP_KEY"
echo ""
echo "🗄️  Database Password (suggestion):"
echo "DB_PASSWORD=$DB_PASSWORD"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "1. Save these credentials in a secure password manager"
echo "2. Never commit these to Git"
echo "3. Use these only in your production .env file"
echo "4. Set proper file permissions: chmod 600 .env"
echo ""
echo "📖 See PRODUCTION-SECURITY.md for complete deployment guide"
echo ""

# Optionally save to a temporary file (with warning)
read -p "💾 Save to temporary file 'temp-credentials.txt'? (y/N): " save_file
if [[ $save_file =~ ^[Yy]$ ]]; then
    cat > temp-credentials.txt << EOF
# 🔒 SECURE CREDENTIALS - DELETE THIS FILE AFTER USE!
# Generated on $(date)

# Add these to your production .env file:
ADMIN_EMAIL=admin@abacoding.com
ADMIN_NAME="Abacoding Admin"
ADMIN_PASSWORD=$ADMIN_PASSWORD

APP_KEY=$APP_KEY

# Database suggestion:
DB_PASSWORD=$DB_PASSWORD

# ⚠️ DELETE THIS FILE AFTER COPYING TO YOUR .env FILE!
EOF
    echo "✅ Credentials saved to 'temp-credentials.txt'"
    echo "⚠️  REMEMBER TO DELETE THIS FILE AFTER USE!"
    echo "   rm temp-credentials.txt"
fi

echo ""
echo "🚀 Ready for secure production deployment!"