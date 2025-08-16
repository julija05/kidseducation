<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Learning Report - Abacoding</title>
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
        .date-badge {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 14px;
            font-weight: 600;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 15px;
            margin: 25px 0;
        }
        .stat-card {
            background: #f9fafb;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            border: 2px solid #e5e7eb;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .section {
            margin: 25px 0;
            padding: 20px;
            background: #f8fafc;
            border-radius: 10px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .program-list {
            list-style: none;
            padding: 0;
        }
        .program-item {
            background: white;
            padding: 10px 15px;
            margin-bottom: 8px;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .achievement-item {
            background: #fef3c7;
            border: 1px solid #fcd34d;
            padding: 10px 15px;
            margin-bottom: 8px;
            border-radius: 6px;
        }
        .security-status {
            padding: 15px;
            border-radius: 8px;
            font-weight: 600;
        }
        .security-good {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #10b981;
        }
        .security-attention {
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #f59e0b;
        }
        .recommendations {
            background: #dbeafe;
            border-left: 4px solid #3b82f6;
            padding: 15px 20px;
            margin: 20px 0;
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
            <div class="logo">📚 Abacoding</div>
            <h1 style="margin: 10px 0;">Daily Learning Report</h1>
            <div class="date-badge">{{ $reportData['date'] }}</div>
            <p style="margin: 15px 0 0 0; color: #6b7280;">{{ $reportData['student_name'] }}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">{{ $timeSpentFormatted }}</div>
                <div class="stat-label">Time Spent Learning</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{{ $reportData['lessons_completed'] }}</div>
                <div class="stat-label">Lessons Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{{ count($reportData['programs_accessed']) }}</div>
                <div class="stat-label">Programs Accessed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{{ $reportData['blocked_content_attempts'] }}</div>
                <div class="stat-label">Content Filtered</div>
            </div>
        </div>

        @if(!empty($reportData['programs_accessed']))
        <div class="section">
            <div class="section-title">
                🎯 Programs Accessed Today
            </div>
            <ul class="program-list">
                @foreach($reportData['programs_accessed'] as $program)
                <li class="program-item">
                    <span>{{ $program['name'] ?? $program }}</span>
                    @if(isset($program['time_spent']))
                    <span style="color: #6b7280; font-size: 14px;">{{ $program['time_spent'] }} min</span>
                    @endif
                </li>
                @endforeach
            </ul>
        </div>
        @endif

        @if(!empty($reportData['learning_achievements']))
        <div class="section">
            <div class="section-title">
                🏆 Learning Achievements
            </div>
            @foreach($reportData['learning_achievements'] as $achievement)
            <div class="achievement-item">
                <strong>{{ $achievement['title'] ?? $achievement }}</strong>
                @if(isset($achievement['description']))
                <p style="margin: 5px 0 0 0; font-size: 14px;">{{ $achievement['description'] }}</p>
                @endif
            </div>
            @endforeach
        </div>
        @endif

        <div class="section">
            <div class="section-title">
                🛡️ Security Status
            </div>
            <div class="security-status {{ count($reportData['security_events']) === 0 && $reportData['blocked_content_attempts'] === 0 ? 'security-good' : 'security-attention' }}">
                {{ $securityStatus }}
            </div>
            
            @if(!empty($reportData['security_events']))
            <div style="margin-top: 15px;">
                <strong>Security Events:</strong>
                <ul style="margin: 8px 0; padding-left: 20px;">
                    @foreach($reportData['security_events'] as $event)
                    <li style="margin-bottom: 5px;">{{ $event['type'] ?? $event }} - {{ $event['time'] ?? 'Today' }}</li>
                    @endforeach
                </ul>
            </div>
            @endif
        </div>

        @if(!empty($reportData['recommendations']))
        <div class="recommendations">
            <h3 style="margin-top: 0; color: #1e40af;">💡 Recommendations for Tomorrow</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
                @foreach($reportData['recommendations'] as $recommendation)
                <li style="margin-bottom: 8px;">{{ $recommendation }}</li>
                @endforeach
            </ul>
        </div>
        @endif

        <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #0369a1;">📖 Learning Summary</h3>
            <p style="margin-bottom: 0;">
                {{ $reportData['student_name'] }} had a 
                @if($reportData['lessons_completed'] >= 3)
                    <strong style="color: #059669;">highly productive</strong>
                @elseif($reportData['lessons_completed'] >= 1)
                    <strong style="color: #0369a1;">good</strong>
                @else
                    <strong style="color: #7c2d12;">light</strong>
                @endif
                learning day, spending {{ $timeSpentFormatted }} on educational activities.
                @if($reportData['blocked_content_attempts'] === 0)
                    All content interactions were appropriate and safe.
                @else
                    Our safety system activated {{ $reportData['blocked_content_attempts'] }} time(s) to ensure safe learning.
                @endif
            </p>
        </div>

        <div class="footer">
            <p><strong>Abacoding - Kids Education Platform</strong></p>
            <p>Daily reports are sent at 6:00 PM. You can adjust your notification preferences in your account settings.</p>
            <p>Questions? Contact us at <a href="{{ config('app.url') }}/contact">{{ config('app.url') }}/contact</a></p>
        </div>
    </div>
</body>
</html>