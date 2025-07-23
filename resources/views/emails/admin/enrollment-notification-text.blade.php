NEW ENROLLMENT REQUEST - ABACODING

Hello Admin,

You have received a new enrollment request that requires your review.

STUDENT INFORMATION:
- Name: {{ $student->name }}
- Email: {{ $student->email }}
- Program: {{ $program->name }}
- Program Price: €{{ number_format($program->price, 2) }}
- Duration: {{ $program->duration }}
- Request Date: {{ $enrollment->enrolled_at->format('F j, Y \a\t g:i A') }}

NEXT STEPS:
1. Review the student's information
2. Check program availability  
3. Log into admin dashboard: {{ config('app.url') }}/admin/enrollments/pending
4. Approve or reject the enrollment request
5. The student will be automatically notified of your decision

Please review this request as soon as possible. The student is waiting for your response.

---
This email was sent from Abacoding Admin System
{{ config('app.url') }}