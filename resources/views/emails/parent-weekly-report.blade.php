<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weekly Learning Summary - Abacoding</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 700px;
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
        .week-badge {
            display: inline-block;
            background: #e0e7ff;
            color: #3730a3;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .summary-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
        }
        .summary-card.green {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        .summary-card.orange {
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
            color: #333;
        }
        .summary-value {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .summary-label {
            font-size: 14px;
            opacity: 0.9;
        }
        .daily-chart {
            background: #f8fafc;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
        }
        .chart-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #1f2937;
        }
        .day-bar {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .day-label {
            width: 60px;
            font-size: 14px;
            color: #6b7280;
        }
        .day-bar-fill {
            height: 20px;
            background: linear-gradient(90deg, #3b82f6, #1d4ed8);
            border-radius: 10px;
            margin-right: 10px;
        }
        .day-time {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
        }
        .section {
            margin: 30px 0;
            padding: 25px;
            background: #f9fafb;
            border-radius: 10px;
        }
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .progress-item {
            background: white;
            padding: 15px;
            margin-bottom: 12px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            margin-top: 8px;
        }
        .progress-fill {
            height: 100%;
            background: #10b981;
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        .action-item {
            background: white;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
        }
        .action-priority {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .priority-high { background: #fecaca; color: #dc2626; }
        .priority-medium { background: #fed7aa; color: #ea580c; }
        .priority-low { background: #dbeafe; color: #2563eb; }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 25px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📊 Abacoding</div>
            <h1 style="margin: 15px 0;">Weekly Learning Summary</h1>
            <div class="week-badge">{{ $reportData['week_start'] }} to {{ $reportData['week_end'] }}</div>
            <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 18px;">{{ $reportData['student_name'] }}</p>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <div class="summary-value">{{ $totalTimeFormatted }}</div>
                <div class="summary-label">Total Learning Time</div>
            </div>
            <div class="summary-card green">
                <div class="summary-value">{{ $averageDailyTime }}</div>
                <div class="summary-label">Average Daily Time</div>
            </div>
            <div class="summary-card orange">
                <div class="summary-value">{{ $progressSummary['lessons_completed'] }}</div>
                <div class="summary-label">Lessons Completed</div>
            </div>
            <div class="summary-card">
                <div class="summary-value">{{ $progressSummary['programs_active'] }}</div>
                <div class="summary-label">Active Programs</div>
            </div>
        </div>

        @if(!empty($reportData['daily_breakdown']))
        <div class="daily-chart">
            <div class="chart-title">📅 Daily Learning Activity</div>
            @php
                $maxTime = max(array_column($reportData['daily_breakdown'], 'minutes'));
                $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            @endphp
            @foreach($reportData['daily_breakdown'] as $index => $day)
            <div class="day-bar">
                <div class="day-label">{{ substr($days[$index] ?? 'Day ' . ($index + 1), 0, 3) }}</div>
                <div class="day-bar-fill" style="width: {{ $maxTime > 0 ? ($day['minutes'] / $maxTime) * 200 : 0 }}px;"></div>
                <div class="day-time">{{ $day['minutes'] }} min</div>
            </div>
            @endforeach
        </div>
        @endif

        @if(!empty($reportData['learning_progress']))
        <div class="section">
            <div class="section-title">
                🎯 Learning Progress
            </div>
            @foreach($reportData['learning_progress']['programs'] ?? [] as $program)
            <div class="progress-item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong>{{ $program['name'] }}</strong>
                    <span style="color: #6b7280; font-size: 14px;">{{ $program['progress'] ?? 0 }}% Complete</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {{ $program['progress'] ?? 0 }}%"></div>
                </div>
            </div>
            @endforeach
            
            @if(!empty($reportData['learning_progress']['achievements']))
            <div style="margin-top: 20px;">
                <h4 style="color: #1f2937;">🏆 Achievements This Week</h4>
                @foreach($reportData['learning_progress']['achievements'] as $achievement)
                <div style="background: #fef3c7; padding: 10px 15px; margin-bottom: 8px; border-radius: 6px; border: 1px solid #fcd34d;">
                    <strong>{{ $achievement['title'] ?? $achievement }}</strong>
                    @if(isset($achievement['date']))
                    <span style="float: right; color: #92400e; font-size: 12px;">{{ $achievement['date'] }}</span>
                    @endif
                </div>
                @endforeach
            </div>
            @endif
        </div>
        @endif

        @if(!empty($reportData['security_summary']))
        <div class="section">
            <div class="section-title">
                🛡️ Security Summary
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #059669;">
                        {{ $reportData['security_summary']['total_events'] ?? 0 }}
                    </div>
                    <div style="font-size: 12px; color: #6b7280;">Security Events</div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #dc2626;">
                        {{ $reportData['security_summary']['blocked_content'] ?? 0 }}
                    </div>
                    <div style="font-size: 12px; color: #6b7280;">Content Blocked</div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #2563eb;">
                        {{ $reportData['security_summary']['safe_sessions'] ?? 7 }}
                    </div>
                    <div style="font-size: 12px; color: #6b7280;">Safe Sessions</div>
                </div>
            </div>
        </div>
        @endif

        @if(!empty($reportData['parent_action_items']))
        <div class="section">
            <div class="section-title">
                📋 Recommended Actions
            </div>
            @foreach($reportData['parent_action_items'] as $item)
            <div class="action-item">
                <div class="action-priority priority-{{ $item['priority'] ?? 'low' }}">
                    {{ $item['priority'] ?? 'low' }} priority
                </div>
                <div style="font-weight: 600; margin-bottom: 5px;">{{ $item['action'] }}</div>
                <div style="font-size: 14px; color: #6b7280;">{{ $item['reason'] }}</div>
            </div>
            @endforeach
        </div>
        @endif

        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; margin: 30px 0;">
            <h3 style="margin-top: 0;">🌟 Week Highlights</h3>
            <p style="margin-bottom: 0;">
                {{ $reportData['student_name'] }} showed 
                @if($progressSummary['lessons_completed'] >= 15)
                    <strong>exceptional dedication</strong>
                @elseif($progressSummary['lessons_completed'] >= 10)
                    <strong>great commitment</strong>
                @elseif($progressSummary['lessons_completed'] >= 5)
                    <strong>good progress</strong>
                @else
                    <strong>steady learning</strong>
                @endif
                this week, completing {{ $progressSummary['lessons_completed'] }} lessons across {{ $progressSummary['programs_active'] }} programs.
                
                @if($progressSummary['overall_progress'] >= 80)
                    They're making excellent progress and should be very proud!
                @elseif($progressSummary['overall_progress'] >= 60)
                    They're on track and building good learning habits!
                @else
                    Every step forward is an achievement worth celebrating!
                @endif
            </p>
        </div>

        <div class="footer">
            <p><strong>Abacoding - Kids Education Platform</strong></p>
            <p>Weekly summaries are sent every Sunday evening. Adjust your preferences anytime in your account settings.</p>
            <p>Questions about your child's progress? <a href="{{ config('app.url') }}/contact">Contact our support team</a></p>
            <p style="margin-top: 15px; font-size: 12px;">This report contains aggregated learning data from {{ $reportData['week_start'] }} to {{ $reportData['week_end'] }}.</p>
        </div>
    </div>
</body>
</html>