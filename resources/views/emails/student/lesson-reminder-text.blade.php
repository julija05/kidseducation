Lesson Reminder - {{ $schedule->title }} Tomorrow

Dear {{ $student->name }},

This is a friendly reminder about your upcoming lesson!

🚨 YOUR LESSON IS TOMORROW!
Time: {{ $schedule->scheduled_at->format('g:i A') }}
Date: {{ $schedule->scheduled_at->format('l, F j, Y') }}

Lesson Details:
- Title: {{ $schedule->title }}
- Date & Time: {{ $schedule->getFormattedScheduledTime() }}
- Duration: {{ $schedule->getFormattedDuration() }}
- Instructor: {{ $admin->name }}
@if($program)
- Program: {{ $program->name }}
@endif
@if($lesson)
- Lesson: {{ $lesson->title }}
@endif

@if($schedule->meeting_link)
Online Meeting:
Your lesson will be conducted online. Use the link below to join:
{{ $schedule->meeting_link }}

💡 Pro tip: Join 5 minutes early to test your audio and video!
@endif

@if($schedule->location)
Location Reminder:
{{ $schedule->location }}

📝 Remember: Arrive 10 minutes before your lesson starts!
@endif

Preparation Checklist:
✅ Review any pre-lesson materials or homework
✅ Prepare your notebook and writing materials
✅ Test your internet connection and device
✅ Find a quiet, well-lit space for learning
✅ Have water nearby to stay hydrated
@if($schedule->meeting_link)
✅ Test your microphone and camera
@endif

Access Your Dashboard:
For lesson materials, homework, and meeting links, visit your student dashboard:
{{ route('login') }}

@if($schedule->description)
What We'll Cover Tomorrow:
{{ $schedule->description }}
@endif

If you need to reschedule or have any questions, please contact us as soon as possible.

We're excited to see you tomorrow!

Best regards,
{{ $admin->name }}
The Abacoding Team

---
This email was sent from Abacoding
{{ config('app.url') }}