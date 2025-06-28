<!DOCTYPE html>
<html>

<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #27AE60;
            color: white;
            padding: 20px;
            text-align: center;
        }

        .content {
            padding: 20px;
            background-color: #f9f9f9;
        }

        .success-box {
            background-color: #D4EDDA;
            border: 1px solid #C3E6CB;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }

        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #27AE60;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Congratulations! You're Enrolled!</h1>
        </div>
        <div class="content">
            <p>Dear {{ $enrollment->user->name }},</p>

            <div class="success-box">
                <p><strong>Great news!</strong> Your enrollment request for <strong>{{ $enrollment->program->name }}</strong> has been approved!</p>
            </div>

            <p>Welcome to our learning community! We're excited to have you join us.</p>

            <p><strong>What's next?</strong></p>
            <ul>
                <li>Log in to your dashboard to access your program materials</li>
                <li>Check your program schedule and upcoming sessions</li>
                <li>Connect with your instructors and fellow students</li>
            </ul>

            <a href="{{ url('/dashboard') }}" class="button">Go to Your Dashboard</a>

            <p>If you have any questions or need assistance getting started, please contact us at support@abacoding.com.</p>

            <p>Best regards,<br>
                The AbaCoding Team</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} AbaCoding. All rights reserved.</p>
        </div>
    </div>
</body>

</html>