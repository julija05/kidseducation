<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emergency Chat Alert</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #dc2626, #ef4444);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        .alert-icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .content {
            padding: 30px;
        }
        .urgent-box {
            background-color: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .visitor-info {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .visitor-info h3 {
            margin-top: 0;
            color: #374151;
        }
        .message-preview {
            background-color: #e5e7eb;
            padding: 15px;
            border-radius: 8px;
            font-style: italic;
            margin: 15px 0;
        }
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #059669, #10b981);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .stats {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
        }
        .stat-item {
            text-align: center;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #dc2626;
        }
        .stat-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="alert-icon">🚨</div>
            <h1>URGENT: Live Chat Request</h1>
            <p style="margin: 0; opacity: 0.9;">Immediate response required</p>
        </div>
        
        <div class="content">
            <div class="urgent-box">
                <h2 style="margin-top: 0; color: #dc2626;">⚡ Emergency Alert</h2>
                <p><strong>A visitor has started a live chat session and needs immediate assistance!</strong></p>
                <p>Since this is a guest user (not registered), they expect real-time support. Please respond as soon as possible to provide excellent customer service.</p>
            </div>
            
            <div class="visitor-info">
                <h3>👤 Visitor Information</h3>
                <p><strong>Name:</strong> {{ $visitorName }}</p>
                @if($visitorEmail)
                <p><strong>Email:</strong> {{ $visitorEmail }}</p>
                @endif
                <p><strong>Session:</strong> {{ $conversation->session_id }}</p>
                <p><strong>Started:</strong> {{ $conversation->created_at->format('M j, Y g:i A') }}</p>
            </div>
            
            <div class="message-preview">
                <h4>💬 First Message:</h4>
                <p>"{{ $firstMessage->message }}"</p>
            </div>
            
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-number">{{ $conversation->created_at->diffInMinutes(now()) }}</div>
                    <div class="stat-label">Minutes Ago</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">LIVE</div>
                    <div class="stat-label">Status</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">{{ $conversation->messages()->count() }}</div>
                    <div class="stat-label">Message{{ $conversation->messages()->count() > 1 ? 's' : '' }}</div>
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ $chatUrl }}" class="action-button">
                    🚀 RESPOND NOW - Open Admin Chat
                </a>
            </div>
            
            <div style="background-color: #fef9c3; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h4 style="margin-top: 0; color: #92400e;">💡 Quick Response Tips:</h4>
                <ul style="margin-bottom: 0;">
                    <li>Greet the visitor warmly and introduce yourself</li>
                    <li>Ask how you can help them today</li>
                    <li>If you can't help immediately, let them know when you'll follow up</li>
                    <li>Keep responses friendly and professional</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Abacoding Live Chat System</strong></p>
            <p>This is an automated emergency alert. Please respond to the chat as soon as possible.</p>
            <p style="font-size: 12px; margin-top: 15px;">
                Time sent: {{ now()->format('M j, Y g:i:s A') }}
            </p>
        </div>
    </div>
</body>
</html>