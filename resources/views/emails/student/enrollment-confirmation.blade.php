<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enrollment Request Received</title>
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
            background-color: #10b981;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            margin: -20px -20px 20px -20px;
            border-radius: 8px 8px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 0 10px;
        }
        .program-info {
            background-color: #f0f9ff;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #10b981;
            margin: 20px 0;
        }
        .info-row {
            margin-bottom: 10px;
        }
        .info-label {
            font-weight: bold;
            color: #374151;
            display: inline-block;
            width: 120px;
        }
        .info-value {
            color: #1f2937;
        }
        .highlight-box {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
        }
        .highlight-box h3 {
            color: #92400e;
            margin: 0 0 10px 0;
        }
        .next-steps {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .next-steps h3 {
            color: #1f2937;
            margin-top: 0;
        }
        .next-steps ul {
            color: #4b5563;
            padding-left: 20px;
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
            color: #10b981;
            font-weight: bold;
        }
        .contact-info {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Enrollment Request Received!</h1>
        </div>
        
        <div class="content">
            <p>Dear {{ $student->name }},</p>
            
            <p>Thank you for your interest in our programs! We have successfully received your enrollment request and wanted to confirm the details with you.</p>
            
            <div class="program-info">
                <div class="info-row">
                    <span class="info-label">Program:</span>
                    <span class="info-value">{{ $program->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Duration:</span>
                    <span class="info-value">{{ $program->duration }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Price:</span>
                    <span class="info-value">€{{ number_format($program->price, 2) }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Request Date:</span>
                    <span class="info-value">{{ $enrollment->enrolled_at->format('F j, Y \a\t g:i A') }}</span>
                </div>
            </div>
            
            <div class="highlight-box">
                <h3>📋 Your enrollment is being reviewed</h3>
                <p><strong>Our team will contact you soon with the next steps.</strong></p>
            </div>
            
            <div class="next-steps">
                <h3>What happens next?</h3>
                <ul>
                    <li><strong>Review Process:</strong> Our team will review your enrollment request within 24-48 hours</li>
                    <li><strong>Contact:</strong> We will reach out to you via email or phone to discuss program details</li>
                    <li><strong>Approval:</strong> Once approved, you'll receive access to your student dashboard</li>
                    <li><strong>Getting Started:</strong> We'll guide you through the setup process and first steps</li>
                </ul>
            </div>
            
            <div class="contact-info">
                <h3>Questions or Need Help?</h3>
                <p>If you have any questions about your enrollment or our programs, don't hesitate to reach out to us:</p>
                <p>
                    <strong>Email:</strong> abacoding@abacoding.com<br>
                    <strong>Response Time:</strong> Within 24 hours
                </p>
            </div>
            
            <p>We're excited about the possibility of having you join our learning community at <span class="brand">Abacoding</span>!</p>
            
            <p>Best regards,<br>
            <strong>The Abacoding Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This email was sent from <span class="brand">Abacoding</span></p>
            <p>{{ config('app.url') }}</p>
        </div>
    </div>
</body>
</html>