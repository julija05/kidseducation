Lesson Scheduled - {{ $schedule->title }}

Dear {{ $student->name }},

Great news! Your lesson has been scheduled. Here are the details:

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
- Type: {{ $schedule->getTypeLabel() }}

@if($schedule->meeting_link)
Online Meeting:
Meeting Link: {{ $schedule->meeting_link }}
Please join the meeting 5 minutes before the scheduled time.
@endif

@if($schedule->location)
Location: {{ $schedule->location }}
Please arrive 10 minutes before the scheduled time.
@endif

@if($schedule->description)
Lesson Description:
{{ $schedule->description }}
@endif

Important Reminders:
- You will receive a reminder email 24 hours before your lesson
- Please log into your account to access lesson materials and links
- If you need to reschedule, please contact us at least 24 hours in advance
- Have your learning materials ready before the lesson starts

Ready to Learn?
To access your lesson materials and meeting links, please log into your student dashboard: {{ route('login') }}

If you have any questions or need to make changes, please don't hesitate to contact us.

We're looking forward to your lesson!

Best regards,
{{ $admin->name }}
The Abacoding Team

---
This email was sent from Abacoding
{{ config('app.url') }}