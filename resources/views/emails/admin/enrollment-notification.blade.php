<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Enrollment Request</title>
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
            background-color: #2563eb;
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
        .student-info {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
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
        .action-buttons {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 0 10px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            text-align: center;
        }
        .btn-approve {
            background-color: #10b981;
            color: #ffffff;
        }
        .btn-review {
            background-color: #2563eb;
            color: #ffffff;
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
            color: #2563eb;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 New Enrollment Request</h1>
        </div>
        
        <div class="content">
            <p>Hello Admin,</p>
            
            <p>You have received a new enrollment request that requires your review.</p>
            
            <div class="student-info">
                <div class="info-row">
                    <span class="info-label">Student:</span>
                    <span class="info-value">{{ $student->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">{{ $student->email }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Program:</span>
                    <span class="info-value">{{ $program->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Program Price:</span>
                    <span class="info-value">€{{ number_format($program->price, 2) }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Duration:</span>
                    <span class="info-value">{{ $program->duration }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Request Date:</span>
                    <span class="info-value">{{ $enrollment->enrolled_at->format('F j, Y \a\t g:i A') }}</span>
                </div>
            </div>
            
            <div class="action-buttons">
                <a href="{{ config('app.url') }}/admin/enrollments/pending" class="btn btn-review">
                    📋 Review Enrollment
                </a>
            </div>
            
            <p>Please log into your admin dashboard to review and approve or reject this enrollment request. The student is waiting for your response.</p>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
                <li>Review the student's information</li>
                <li>Check program availability</li>
                <li>Approve or reject the enrollment request</li>
                <li>The student will be automatically notified of your decision</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>This email was sent from <span class="brand">Abacoding</span> Admin System</p>
            <p>{{ config('app.url') }}</p>
        </div>
    </div>
</body>
</html>