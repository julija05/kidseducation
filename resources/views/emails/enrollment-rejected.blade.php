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
            background-color: #95A5A6;
            color: white;
            padding: 20px;
            text-align: center;
        }

        .content {
            padding: 20px;
            background-color: #f9f9f9;
        }

        .info-box {
            background-color: #F8D7DA;
            border: 1px solid #F5C6CB;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }

        .reason-box {
            background-color: white;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #95A5A6;
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
            <h1>Enrollment Update</h1>
        </div>
        <div class="content">
            <p>Dear {{ $enrollment->user->name }},</p>

            <p>Thank you for your interest in <strong>{{ $enrollment->program->name }}</strong>.</p>

            <div class="info-box">
                <p>After careful review, we regret to inform you that we are unable to approve your enrollment request at this time.</p>
            </div>

            @if($enrollment->rejection_reason)
            <div class="reason-box">
                <h3>Reason:</h3>
                <p>{{ $enrollment->rejection_reason }}</p>
            </div>
            @endif

            <p>We encourage you to:</p>
            <ul>
                <li>Review our other available programs that might better suit your needs</li>
                <li>Contact us at support@abacoding.com if you have questions or need clarification</li>
                <li>Consider reapplying in the future if circumstances change</li>
            </ul>

            <p>We appreciate your understanding and wish you the best in your learning journey.</p>

            <p>Best regards,<br>
                The AbaCoding Team</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} AbaCoding. All rights reserved.</p>
        </div>
    </div>
</body>

</html>