#!/bin/bash

# Deployment script for switching email configuration
# Usage: ./deploy-email-config.sh [local|production]

set -e

CONFIG_TYPE=${1:-"local"}

echo "🚀 Configuring email settings for: $CONFIG_TYPE"

if [ "$CONFIG_TYPE" = "production" ]; then
    echo "📧 Switching to Postmark (Production) configuration..."
    
    # Prompt for Postmark token if not provided
    if [ -z "$POSTMARK_TOKEN" ]; then
        echo "❓ Enter your Postmark server token:"
        read -s POSTMARK_TOKEN
    fi
    
    # Prompt for domain if not provided
    if [ -z "$MAIL_DOMAIN" ]; then
        echo "❓ Enter your verified domain (e.g., yourdomain.com):"
        read MAIL_DOMAIN
    fi
    
    # Update .env file
    sed -i.bak \
        -e "s/^MAIL_MAILER=smtp/# MAIL_MAILER=smtp/" \
        -e "s/^MAIL_HOST=mailpit/# MAIL_HOST=mailpit/" \
        -e "s/^MAIL_PORT=1025/# MAIL_PORT=1025/" \
        -e "s/^MAIL_USERNAME=null/# MAIL_USERNAME=null/" \
        -e "s/^MAIL_PASSWORD=null/# MAIL_PASSWORD=null/" \
        -e "s/^MAIL_ENCRYPTION=null/# MAIL_ENCRYPTION=null/" \
        -e "s/^MAIL_FROM_ADDRESS=\"noreply@abacoding.localhost\"/# MAIL_FROM_ADDRESS=\"noreply@abacoding.localhost\"/" \
        -e "s/^# MAIL_MAILER=postmark/MAIL_MAILER=postmark/" \
        -e "s/^# POSTMARK_TOKEN=.*/POSTMARK_TOKEN=$POSTMARK_TOKEN/" \
        -e "s/^# MAIL_FROM_ADDRESS=\"noreply@yourdomain.com\"/MAIL_FROM_ADDRESS=\"noreply@$MAIL_DOMAIN\"/" \
        .env
    
    echo "✅ Postmark configuration activated"
    echo "📬 From address: noreply@$MAIL_DOMAIN"
    
elif [ "$CONFIG_TYPE" = "local" ]; then
    echo "🏠 Switching to Mailpit (Local Development) configuration..."
    
    # Update .env file
    sed -i.bak \
        -e "s/^MAIL_MAILER=postmark/# MAIL_MAILER=postmark/" \
        -e "s/^POSTMARK_TOKEN=.*/# POSTMARK_TOKEN=your_production_postmark_token_here/" \
        -e "s/^MAIL_FROM_ADDRESS=\"noreply@.*\"/# MAIL_FROM_ADDRESS=\"noreply@yourdomain.com\"/" \
        -e "s/^# MAIL_MAILER=smtp/MAIL_MAILER=smtp/" \
        -e "s/^# MAIL_HOST=mailpit/MAIL_HOST=mailpit/" \
        -e "s/^# MAIL_PORT=1025/MAIL_PORT=1025/" \
        -e "s/^# MAIL_USERNAME=null/MAIL_USERNAME=null/" \
        -e "s/^# MAIL_PASSWORD=null/MAIL_PASSWORD=null/" \
        -e "s/^# MAIL_ENCRYPTION=null/MAIL_ENCRYPTION=null/" \
        -e "s/^# MAIL_FROM_ADDRESS=\"noreply@abacoding.localhost\"/MAIL_FROM_ADDRESS=\"noreply@abacoding.localhost\"/" \
        .env
    
    echo "✅ Mailpit configuration activated"
    echo "📬 From address: noreply@abacoding.localhost"
    echo "🌐 Mailpit UI: http://localhost:8025"
    
else
    echo "❌ Invalid configuration type. Use 'local' or 'production'"
    echo "Usage: ./deploy-email-config.sh [local|production]"
    exit 1
fi

# Clear Laravel configuration cache
echo "🧹 Clearing Laravel configuration cache..."
php artisan config:clear

# Show current mail configuration
echo "📋 Current mail configuration:"
php artisan config:show mail.default mail.from

echo ""
echo "🎉 Email configuration updated successfully!"
echo ""
echo "Next steps:"
if [ "$CONFIG_TYPE" = "production" ]; then
    echo "1. Verify your domain is validated in Postmark"
    echo "2. Test email sending: php artisan tinker"
    echo "3. Monitor delivery in Postmark dashboard"
else
    echo "1. Ensure Docker services are running"
    echo "2. Test email sending: php artisan tinker"
    echo "3. Check emails in Mailpit UI: http://localhost:8025"
fi