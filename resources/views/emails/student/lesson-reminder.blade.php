<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lesson Reminder</title>
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
            background-color: #f59e0b;
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
        .lesson-info {
            background-color: #fef3c7;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
        }
        .info-row {
            margin-bottom: 10px;
        }
        .info-label {
            font-weight: bold;
            color: #374151;
            display: inline-block;
            width: 140px;
        }
        .info-value {
            color: #1f2937;
        }
        .countdown-box {
            background-color: #fef2f2;
            border: 2px solid #ef4444;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
        }
        .countdown-box h3 {
            color: #dc2626;
            margin: 0 0 10px 0;
            font-size: 20px;
        }
        .countdown-time {
            font-size: 24px;
            font-weight: bold;
            color: #dc2626;
        }
        .meeting-details {
            background-color: #f0f9ff;
            border: 1px solid #3b82f6;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .meeting-details h3 {
            color: #1d4ed8;
            margin-top: 0;
        }
        .btn {
            display: inline-block;
            background-color: #f59e0b;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 10px 0;
        }
        .btn:hover {
            background-color: #d97706;
        }
        .btn-primary {
            background-color: #3b82f6;
        }
        .btn-primary:hover {
            background-color: #2563eb;
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
            color: #f59e0b;
            font-weight: bold;
        }
        .checklist {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .checklist h4 {
            color: #1f2937;
            margin-top: 0;
        }
        .checklist ul {
            color: #4b5563;
            padding-left: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Lesson Reminder</h1>
        </div>
        
        <div class="content">
            <p>Dear {{ $student->name }},</p>
            
            <p>This is a friendly reminder about your upcoming lesson!</p>
            
            <div class="countdown-box">
                <h3>🚨 Your lesson is tomorrow!</h3>
                <div class="countdown-time">{{ $schedule->scheduled_at->format('g:i A') }}</div>
                <p>{{ $schedule->scheduled_at->format('l, F j, Y') }}</p>
            </div>
            
            <div class="lesson-info">
                <div class="info-row">
                    <span class="info-label">Lesson Title:</span>
                    <span class="info-value"><strong>{{ $schedule->title }}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date & Time:</span>
                    <span class="info-value"><strong>{{ $schedule->getFormattedScheduledTime() }}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Duration:</span>
                    <span class="info-value">{{ $schedule->getFormattedDuration() }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Instructor:</span>
                    <span class="info-value">{{ $admin->name }}</span>
                </div>
                @if($program)
                <div class="info-row">
                    <span class="info-label">Program:</span>
                    <span class="info-value">{{ $program->name }}</span>
                </div>
                @endif
                @if($lesson)
                <div class="info-row">
                    <span class="info-label">Lesson:</span>
                    <span class="info-value">{{ $lesson->title }}</span>
                </div>
                @endif
            </div>
            
            @if($schedule->meeting_link)
            <div class="meeting-details">
                <h3>🔗 Ready to Join?</h3>
                <p>Your lesson will be conducted online. Use the link below to join:</p>
                <a href="{{ $schedule->meeting_link }}" class="btn btn-primary" target="_blank">Join Meeting Tomorrow</a>
                <p><small>💡 <strong>Pro tip:</strong> Join 5 minutes early to test your audio and video!</small></p>
            </div>
            @endif
            
            @if($schedule->location)
            <div class="meeting-details">
                <h3>📍 Location Reminder</h3>
                <p><strong>{{ $schedule->location }}</strong></p>
                <p><small>📝 <strong>Remember:</strong> Arrive 10 minutes before your lesson starts!</small></p>
            </div>
            @endif
            
            <div class="checklist">
                <h4>✅ Preparation Checklist</h4>
                <ul>
                    <li>Review any pre-lesson materials or homework</li>
                    <li>Prepare your notebook and writing materials</li>
                    <li>Test your internet connection and device</li>
                    <li>Find a quiet, well-lit space for learning</li>
                    <li>Have water nearby to stay hydrated</li>
                    @if($schedule->meeting_link)
                    <li>Test your microphone and camera</li>
                    @endif
                </ul>
            </div>
            
            <div class="meeting-details">
                <h3>🎯 Access Your Dashboard</h3>
                <p>For lesson materials, homework, and meeting links, visit your student dashboard:</p>
                <a href="{{ route('login') }}" class="btn">Go to Dashboard</a>
            </div>
            
            @if($schedule->description)
            <div class="lesson-info">
                <h4>📚 What We'll Cover Tomorrow</h4>
                <p>{{ $schedule->description }}</p>
            </div>
            @endif
            
            <p>If you need to reschedule or have any questions, please contact us as soon as possible.</p>
            
            <p>We're excited to see you tomorrow!</p>
            
            <p>Best regards,<br>
            <strong>{{ $admin->name }}</strong><br>
            <strong>The Abacoding Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This email was sent from <span class="brand">Abacoding</span></p>
            <p>{{ config('app.url') }}</p>
        </div>
    </div>
</body>
</html>