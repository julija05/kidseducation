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
            background-color: #4A90E2;
            color: white;
            padding: 20px;
            text-align: center;
        }

        .content {
            padding: 20px;
            background-color: #f9f9f9;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 14px;
        }

        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4A90E2;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Enrollment Request Received</h1>
        </div>
        <div class="content">
            <p>Dear {{ $user->name }},</p>

            <p>Thank you for your interest in enrolling in <strong>{{ $program->name }}</strong>!</p>

            <p>We have successfully received your enrollment request. Our team will review your application and get back to you as soon as possible.</p>

            <p><strong>What happens next?</strong></p>
            <ul>
                <li>Our admissions team will review your enrollment request</li>
                <li>You will receive an email notification once your enrollment is processed</li>
                <li>This typically takes 1-2 business days</li>
            </ul>

            <p>If you have any questions in the meantime, please don't hesitate to contact us at support@abacoding.com.</p>

            <p>Best regards,<br>
                The AbaCoding Team</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} AbaCoding. All rights reserved.</p>
        </div>
    </div>
</body>

</html>