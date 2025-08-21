<?php

namespace App\Http\Controllers;

use App\Mail\StudentEnrollmentConfirmation;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class TestEmailController extends Controller
{
    public function testStudentEmail(Request $request)
    {
        // Only allow this in non-production environments
        if (app()->environment('production')) {
            abort(404);
        }

        $testEmail = $request->get('email', 'test@example.com');

        // Get the latest enrollment for testing
        $enrollment = Enrollment::with(['user', 'program'])->latest()->first();

        if (! $enrollment) {
            return response()->json(['error' => 'No enrollment found for testing']);
        }

        try {
            // Test the email creation
            $mail = new StudentEnrollmentConfirmation($enrollment);

            // Log details
            Log::info('Testing student email', [
                'test_email' => $testEmail,
                'enrollment_id' => $enrollment->id,
                'student_name' => $enrollment->user->name,
                'program_name' => $enrollment->program->name,
            ]);

            // Send the email
            Mail::to($testEmail)->send($mail);

            Log::info('Test email sent successfully to: '.$testEmail);

            return response()->json([
                'success' => true,
                'message' => 'Test email sent to '.$testEmail,
                'enrollment_details' => [
                    'student' => $enrollment->user->name,
                    'program' => $enrollment->program->name,
                    'created_at' => $enrollment->created_at->format('Y-m-d H:i:s'),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Test email failed', [
                'error' => $e->getMessage(),
                'test_email' => $testEmail,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to send test email: '.$e->getMessage(),
            ], 500);
        }
    }
}
