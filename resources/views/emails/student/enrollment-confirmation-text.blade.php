ENROLLMENT REQUEST RECEIVED - ABACODING

Dear {{ $student->name }},

Thank you for your interest in our programs! We have successfully received your enrollment request and wanted to confirm the details with you.

ENROLLMENT DETAILS:
- Program: {{ $program->name }}
- Duration: {{ $program->duration }}
- Price: €{{ number_format($program->price, 2) }}
- Request Date: {{ $enrollment->enrolled_at->format('F j, Y \a\t g:i A') }}

YOUR ENROLLMENT IS BEING REVIEWED
Our team will contact you soon with the next steps.

WHAT HAPPENS NEXT?
1. Review Process: Our team will review your enrollment request within 24-48 hours
2. Contact: We will reach out to you via email or phone to discuss program details
3. Approval: Once approved, you'll receive access to your student dashboard
4. Getting Started: We'll guide you through the setup process and first steps

QUESTIONS OR NEED HELP?
If you have any questions about your enrollment or our programs, don't hesitate to reach out to us:

Email: abacoding@abacoding.com
Response Time: Within 24 hours

We're excited about the possibility of having you join our learning community at Abacoding!

Best regards,
The Abacoding Team

---
This email was sent from Abacoding
{{ config('app.url') }}