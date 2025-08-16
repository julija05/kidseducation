<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Alert - Abacoding</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .alert-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            color: white;
            margin-bottom: 20px;
        }
        .alert-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
        .alert-title {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1f2937;
        }
        .alert-details {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .detail-label {
            font-weight: 600;
            color: #6b7280;
        }
        .recommendations {
            background: #dbeafe;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
        }
        .recommendations h3 {
            color: #1e40af;
            margin-top: 0;
        }
        .recommendations ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .recommendations li {
            margin-bottom: 8px;
        }
        .action-buttons {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 0 10px;
        }
        .btn-secondary {
            background: #6b7280;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎯 Abacoding</div>
            <div class="alert-icon">{{ $severityIcon }}</div>
            <div class="alert-badge" style="background-color: {{ $severityColor }}">
                {{ strtoupper($alertData['severity']) }} PRIORITY
            </div>
        </div>

        <div class="alert-title">
            Security Alert for {{ $alertData['student_name'] }}
        </div>

        <p>Dear Parent/Guardian,</p>

        <p>We want to inform you about a security event that occurred while {{ $alertData['student_name'] }} was using our platform.</p>

        <div class="alert-details">
            <div class="detail-row">
                <span class="detail-label">Alert Type:</span>
                <span>{{ ucfirst(str_replace('_', ' ', $alertData['alert_type'])) }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span>{{ $alertData['timestamp']->format('F j, Y \a\t g:i A') }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Severity:</span>
                <span style="color: {{ $severityColor }}; font-weight: bold;">{{ strtoupper($alertData['severity']) }}</span>
            </div>
            @if(!empty($alertData['details']))
            <div class="detail-row">
                <span class="detail-label">Details:</span>
                <span>{{ implode(', ', array_values($alertData['details'])) }}</span>
            </div>
            @endif
        </div>

        @if($alertData['severity'] === 'critical')
        <div style="background: #fef2f2; border: 2px solid #fca5a5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong style="color: #dc2626;">⚠️ CRITICAL ALERT:</strong> This incident requires immediate attention. Please review your child's online activity and consider having a conversation about online safety.
        </div>
        @endif

        <div class="recommendations">
            <h3>🛡️ Recommended Actions</h3>
            <ul>
                @foreach($alertData['recommendations'] as $recommendation)
                <li>{{ $recommendation }}</li>
                @endforeach
            </ul>
        </div>

        <div class="action-buttons">
            <a href="{{ config('app.url') }}/dashboard" class="btn">
                View Student Dashboard
            </a>
            <a href="{{ config('app.url') }}/contact" class="btn btn-secondary">
                Contact Support
            </a>
        </div>

        <p>
            <strong>What we're doing:</strong> Our security system automatically detected and handled this event to protect {{ $alertData['student_name'] }}. All activities are monitored in real-time, and we maintain detailed logs for your review.
        </p>

        <p>
            If you have any questions or concerns, please don't hesitate to contact our support team. We're committed to providing a safe learning environment for your child.
        </p>

        <div class="footer">
            <p><strong>Abacoding - Kids Education Platform</strong></p>
            <p>This is an automated security notification. Please do not reply to this email.</p>
            <p>For support, visit <a href="{{ config('app.url') }}/contact">{{ config('app.url') }}/contact</a></p>
        </div>
    </div>
</body>
</html>