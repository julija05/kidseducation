<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lesson Scheduled</title>
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
            background-color: #3b82f6;
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
            background-color: #eff6ff;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #3b82f6;
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
        .highlight-box {
            background-color: #f0fdf4;
            border: 1px solid #22c55e;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
        }
        .highlight-box h3 {
            color: #15803d;
            margin: 0 0 10px 0;
        }
        .meeting-details {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .meeting-details h3 {
            color: #92400e;
            margin-top: 0;
        }
        .btn {
            display: inline-block;
            background-color: #3b82f6;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 10px 0;
        }
        .btn:hover {
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
            color: #3b82f6;
            font-weight: bold;
        }
        .important-note {
            background-color: #fee2e2;
            border: 1px solid #ef4444;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .important-note h4 {
            color: #dc2626;
            margin-top: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 Lesson Scheduled!</h1>
        </div>
        
        <div class="content">
            <p>Dear {{ $student->name }},</p>
            
            <p>Great news! Your lesson has been scheduled. Here are the details:</p>
            
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
                <div class="info-row">
                    <span class="info-label">Type:</span>
                    <span class="info-value">{{ $schedule->getTypeLabel() }}</span>
                </div>
            </div>
            
            @if($schedule->meeting_link)
            <div class="meeting-details">
                <h3>🔗 Online Meeting Details</h3>
                <p><strong>Meeting Link:</strong></p>
                <a href="{{ $schedule->meeting_link }}" class="btn" target="_blank">Join Meeting</a>
                <p><small>Please join the meeting 5 minutes before the scheduled time.</small></p>
            </div>
            @endif
            
            @if($schedule->location)
            <div class="meeting-details">
                <h3>📍 Location</h3>
                <p><strong>{{ $schedule->location }}</strong></p>
                <p><small>Please arrive 10 minutes before the scheduled time.</small></p>
            </div>
            @endif
            
            @if($schedule->description)
            <div class="highlight-box">
                <h3>📝 Lesson Description</h3>
                <p>{{ $schedule->description }}</p>
            </div>
            @endif
            
            <div class="important-note">
                <h4>🔔 Important Reminders</h4>
                <ul>
                    <li>You will receive a reminder email 24 hours before your lesson</li>
                    <li>Please log into your account to access lesson materials and links</li>
                    <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
                    <li>Have your learning materials ready before the lesson starts</li>
                </ul>
            </div>
            
            <div class="highlight-box">
                <h3>🎯 Ready to Learn?</h3>
                <p>To access your lesson materials and meeting links, please log into your student dashboard.</p>
                <a href="{{ route('login') }}" class="btn">Login to Your Account</a>
            </div>
            
            <p>If you have any questions or need to make changes, please don't hesitate to contact us.</p>
            
            <p>We're looking forward to your lesson!</p>
            
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