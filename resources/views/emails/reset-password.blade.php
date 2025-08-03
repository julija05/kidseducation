<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - {{ $appName }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #dc2626;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            margin: -20px -20px 20px -20px;
            border-radius: 8px 8px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            text-align: center;
        }
        .content {
            padding: 0 10px;
        }
        .reset-info {
            background-color: #fef2f2;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #dc2626;
            margin: 20px 0;
        }
        .reset-box {
            background-color: #fef2f2;
            border: 2px solid #dc2626;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
        }
        .reset-box h3 {
            color: #dc2626;
            margin: 0 0 10px 0;
            font-size: 20px;
        }
        .reset-details {
            background-color: #f0f9ff;
            border: 1px solid #dc2626;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .reset-details h3 {
            color: #dc2626;
            margin-top: 0;
        }
        .btn {
            display: inline-block;
            background-color: #dc2626;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 10px 0;
        }
        .btn:hover {
            background-color: #b91c1c;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .brand {
            color: #dc2626;
            font-weight: bold;
        }
        .security-note {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .security-note h4 {
            color: #1f2937;
            margin-top: 0;
        }
        .security-note p {
            color: #4b5563;
            margin: 10px 0;
        }
        .warning-box {
            background-color: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .warning-box h4 {
            color: #92400e;
            margin-top: 0;
        }
        .warning-box p {
            color: #d97706;
            margin: 10px 0;
        }
        .alternative-link {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            word-break: break-all;
            font-size: 12px;
            color: #475569;
        }
        @media (max-width: 600px) {
            .footer {
                text-align: left;
                padding: 15px 10px;
            }
            .footer p {
                margin: 8px 0;
                line-height: 1.4;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset</h1>
        </div>
        
        <div class="content">
            <p>Hello {{ $user->first_name ?? $user->name ?? 'there' }}! 👋</p>
            
            <p>We received a request to reset the password for your <strong>{{ $appName }}</strong> account.</p>
            
            <div class="reset-box">
                <h3>🔑 Reset Your Password</h3>
                <p>Click the button below to create a new password for your account.</p>
            </div>
            
            <div class="reset-info">
                <p><strong>Account email:</strong> {{ $user->email }}</p>
                <p><strong>Reset requested:</strong> {{ now()->format('F j, Y \a\t g:i A') }}</p>
            </div>
            
            <div class="reset-details">
                <h3>🔗 Ready to Reset?</h3>
                <p>Click the button below to set a new password for your account:</p>
                <a href="{{ $url }}" class="btn" target="_blank">🔑 Reset My Password</a>
                <p><small>💡 <strong>Pro tip:</strong> This link will expire in {{ $count }} minutes for your security!</small></p>
            </div>
            
            <div class="security-note">
                <h4>🔒 Important Security Information</h4>
                <p>This password reset link will expire in <strong>{{ $count }} minutes</strong> for your security.</p>
                <p>After clicking the link, you'll be able to create a new password for your account.</p>
            </div>
            
            <div class="warning-box">
                <h4>⚠️ Didn't Request This?</h4>
                <p>If you didn't request a password reset, you can safely ignore this email.</p>
                <p>Your password will remain unchanged, and your account is secure.</p>
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            
            <div class="alternative-link">
                {{ $url }}
            </div>
            
            <div class="security-note">
                <h4>🛡️ Security Tips</h4>
                <ul>
                    <li>Choose a strong, unique password</li>
                    <li>Use a combination of letters, numbers, and symbols</li>
                    <li>Don't reuse passwords from other accounts</li>
                    <li>Consider using a password manager</li>
                </ul>
            </div>
            
            <p><strong>Need help?</strong> If you're having trouble resetting your password or didn't request this reset, please contact our support team for assistance.</p>
            
            <p>Best regards,<br>
            <strong>The {{ $appName }} Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This email was sent from <span class="brand">{{ $appName }}</span></p>
            <p>{{ $user->email }}</p>
            <p>If you didn't make this request, please ignore this email.</p>
        </div>
    </div>
</body>
</html>