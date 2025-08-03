<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - {{ $appName }}</title>
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
            background-color: #8b5cf6;
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
        .verification-info {
            background-color: #f3e8ff;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #8b5cf6;
            margin: 20px 0;
        }
        .verification-box {
            background-color: #fef2f2;
            border: 2px solid #8b5cf6;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
        }
        .verification-box h3 {
            color: #7c3aed;
            margin: 0 0 10px 0;
            font-size: 20px;
        }
        .verify-details {
            background-color: #f0f9ff;
            border: 1px solid #8b5cf6;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .verify-details h3 {
            color: #7c3aed;
            margin-top: 0;
        }
        .btn {
            display: inline-block;
            background-color: #8b5cf6;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 10px 0;
        }
        .btn:hover {
            background-color: #7c3aed;
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
            color: #8b5cf6;
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
            <h1>🎓 Email Verification</h1>
        </div>
        
        <div class="content">
            <p>Hello {{ $user->first_name ?? $user->name ?? 'there' }}! 👋</p>
            
            <p>Welcome to <strong>{{ $appName }}</strong>! We're excited to have you join our educational community.</p>
            
            <div class="verification-box">
                <h3>📧 Please verify your email address</h3>
                <p>To get started and access all our amazing learning features, please verify your email address.</p>
            </div>
            
            <div class="verification-info">
                <p><strong>Email to verify:</strong> {{ $user->email }}</p>
                <p><strong>Account created:</strong> {{ $user->created_at->format('F j, Y \a\t g:i A') }}</p>
            </div>
            
            <div class="verify-details">
                <h3>🔗 Ready to Get Started?</h3>
                <p>Click the button below to verify your email address and unlock your account:</p>
                <a href="{{ $url }}" class="btn" target="_blank">✉️ Verify My Email Address</a>
                <p><small>💡 <strong>Pro tip:</strong> This link will expire in 60 minutes for your security!</small></p>
            </div>
            
            <div class="security-note">
                <h4>🔒 Security Information</h4>
                <p>This verification link will expire in <strong>60 minutes</strong> for your security.</p>
                <p>If you didn't create an account with {{ $appName }}, you can safely ignore this email.</p>
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            
            <div class="alternative-link">
                {{ $url }}
            </div>
            
            <p>Once verified, you'll be able to:</p>
            <ul>
                <li>Access all educational programs</li>
                <li>Track your learning progress</li>
                <li>Join interactive lessons</li>
                <li>Download course materials</li>
            </ul>
            
            <p>If you have any questions or need help, please don't hesitate to contact our support team.</p>
            
            <p>Welcome to the family!</p>
            
            <p>Best regards,<br>
            <strong>The {{ $appName }} Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This email was sent from <span class="brand">{{ $appName }}</span></p>
            <p>{{ $user->email }}</p>
            <p>If you didn't request this verification, please ignore this email.</p>
        </div>
    </div>
</body>
</html>