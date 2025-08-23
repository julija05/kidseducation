# Postmark Email Configuration Guide

This guide will help you set up Postmark for production email delivery in the Abacoding Kids Education Website.

## Prerequisites

- Postmark account (https://postmarkapp.com)
- Domain verified in Postmark
- Server configured in Postmark

## Step 1: Postmark Account Setup

1. **Create a Postmark Account**
   - Go to https://postmarkapp.com
   - Sign up for an account
   - Verify your email address

2. **Add and Verify Your Domain**
   - In Postmark dashboard, go to "Senders" → "Signatures"
   - Add your domain (e.g., `yourdomain.com`)
   - Follow DNS verification steps
   - Wait for domain verification (usually takes 24-48 hours)

3. **Create a Server**
   - Go to "Servers" in Postmark dashboard
   - Create a new server (e.g., "Abacoding Production")
   - Note down the Server API Token

## Step 2: Laravel Configuration

### Update Environment Variables

In your production `.env` file, update the following:

```env
# Email Configuration - Postmark
MAIL_MAILER=postmark
POSTMARK_TOKEN=your_actual_postmark_server_token_here
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="Abacoding"

# Optional: Message Stream ID (for advanced configurations)
# POSTMARK_MESSAGE_STREAM_ID=outbound
```

### Verify Configuration

The application already includes:
- ✅ Postmark package: `symfony/postmark-mailer` (installed)
- ✅ Mail configuration: `config/mail.php` (configured)
- ✅ Mail service provider (Laravel default)

## Step 3: Email Templates and Domains

### Recommended Email Addresses

For a kids education platform, use these email addresses:

```env
# Production Email Addresses
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="Abacoding"

# Additional addresses you might want to set up:
# - support@yourdomain.com (for user support)
# - hello@yourdomain.com (for general inquiries)
# - security@yourdomain.com (for security notifications)
```

### DNS Configuration

Add these DNS records to your domain:

```dns
# DKIM Record (provided by Postmark after domain verification)
# Example format:
20230101._domainkey.yourdomain.com. CNAME 20230101.dkim.postmarkapp.com.

# Return-Path Domain (optional but recommended)
pm-bounces.yourdomain.com. CNAME pm.mtasv.net.
```

## Step 4: Testing Email Configuration

### Test Email Sending

1. **Artisan Command Test**
   ```bash
   php artisan tinker
   Mail::raw('Test email from Abacoding', function ($message) {
       $message->to('test@example.com')->subject('Test Email');
   });
   ```

2. **Contact Form Test**
   - Submit the contact form on your website
   - Check Postmark dashboard for email activity

### Test Email Content

The application sends emails for:
- ✅ Contact form submissions
- ✅ User registration confirmations
- ✅ Password reset requests
- ✅ Enrollment notifications
- ✅ Parent/admin notifications

## Step 5: Production Deployment Checklist

### Before Deployment

- [ ] Postmark account created and verified
- [ ] Domain added and verified in Postmark
- [ ] Server created in Postmark dashboard
- [ ] DNS records configured
- [ ] POSTMARK_TOKEN obtained from server settings

### Environment Configuration

- [ ] `MAIL_MAILER=postmark` set in production `.env`
- [ ] `POSTMARK_TOKEN` configured with actual token
- [ ] `MAIL_FROM_ADDRESS` set to verified domain email
- [ ] `MAIL_FROM_NAME` set to "Abacoding"

### Testing After Deployment

- [ ] Contact form sends emails successfully
- [ ] Registration emails work
- [ ] Password reset emails work
- [ ] Admin notification emails work
- [ ] Check Postmark dashboard for delivery statistics

## Step 6: Monitoring and Maintenance

### Postmark Dashboard Monitoring

Monitor these metrics in Postmark:
- **Delivery Rate**: Should be >98%
- **Bounce Rate**: Should be <2%
- **Complaint Rate**: Should be <0.1%
- **Open Rate**: For transactional emails, varies

### Email Best Practices

1. **Sender Reputation**
   - Use consistent "From" addresses
   - Maintain low bounce rates
   - Handle unsubscribes properly

2. **Content Guidelines**
   - Use clear, professional subject lines
   - Include unsubscribe links where required
   - Follow COPPA guidelines for children's data

3. **Compliance**
   - GDPR compliance for EU users
   - COPPA compliance for children under 13
   - CAN-SPAM compliance for US users

## Troubleshooting

### Common Issues

1. **Emails Not Sending**
   - Verify POSTMARK_TOKEN is correct
   - Check domain verification status
   - Ensure FROM address uses verified domain

2. **Emails Going to Spam**
   - Complete DKIM setup
   - Configure return-path domain
   - Review email content for spam triggers

3. **High Bounce Rate**
   - Validate email addresses before sending
   - Remove invalid addresses from lists
   - Monitor bounce webhooks

### Debug Commands

```bash
# Test mail configuration
php artisan config:show mail

# Clear configuration cache
php artisan config:clear

# Test email sending
php artisan tinker
# Then run: Mail::raw('Test', fn($m) => $m->to('test@example.com')->subject('Test'));
```

## Security Considerations

### API Token Security
- Store POSTMARK_TOKEN in environment variables only
- Never commit tokens to version control
- Rotate tokens periodically
- Use different tokens for staging/production

### Email Content Security
- Sanitize user input in emails
- Use Laravel's built-in XSS protection
- Validate email addresses before sending
- Log email sending for audit purposes

## Support and Resources

- **Postmark Documentation**: https://postmarkapp.com/developer
- **Laravel Mail Documentation**: https://laravel.com/docs/11.x/mail
- **Postmark Support**: https://postmarkapp.com/support

## Cost Considerations

Postmark pricing (as of 2024):
- First 100 emails/month: Free
- $1.50 per 1,000 emails after that
- Volume discounts available

For a kids education platform, typical usage:
- Contact form submissions: 50-100/month
- User notifications: 200-500/month
- Admin alerts: 100-200/month

Estimated cost: $5-15/month for most educational platforms.

---

## Quick Reference

### Current Configuration Status
- ✅ Postmark package installed
- ✅ Mail configuration ready
- ✅ Environment variables documented
- ⏳ Production token needed
- ⏳ Domain verification needed

### Next Steps
1. Set up Postmark account
2. Verify domain
3. Update production environment variables
4. Test email delivery
5. Deploy to production