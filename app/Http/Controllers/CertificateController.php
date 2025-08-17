<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\Enrollment;
use App\Services\CertificateGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CertificateController extends Controller
{
    protected CertificateGeneratorService $certificateService;

    public function __construct(CertificateGeneratorService $certificateService)
    {
        $this->certificateService = $certificateService;
    }

    /**
     * Generate certificate for completed program
     */
    public function generate(Request $request, Program $program)
    {
        $user = Auth::user();
        
        if (!$user->hasRole('student')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if student has completed the program
        $enrollment = $user->enrollments()
            ->where('program_id', $program->id)
            ->where('status', 'completed')
            ->first();

        if (!$enrollment) {
            return response()->json([
                'error' => 'Program not completed',
                'message' => 'You must complete all lessons in this program to generate a certificate.'
            ], 400);
        }

        // Get language from request, default to English
        $language = $request->input('language', 'en');
        
        // Validate language
        if (!in_array($language, ['en', 'mk'])) {
            $language = 'en';
        }

        try {
            $filename = $this->certificateService->getOrGenerateCertificate($user, $program, $language);
            $downloadUrl = $this->certificateService->getCertificateUrl($filename);

            $isHtmlCertificate = pathinfo($filename, PATHINFO_EXTENSION) === 'html';
            
            return response()->json([
                'success' => true,
                'message' => 'Certificate generated successfully!',
                'download_url' => $downloadUrl,
                'filename' => basename($filename),
                'is_html' => $isHtmlCertificate,
                'view_url' => $isHtmlCertificate ? route('certificates.view', ['filename' => basename($filename)]) : $downloadUrl,
                'program_name' => $program->name,
                'completion_date' => $enrollment->completed_at?->format('F j, Y'),
                'levels_completed' => $enrollment->highest_unlocked_level ?? 0,
                'total_points' => $enrollment->quiz_points ?? 0,
                'language' => $language,
            ]);
        } catch (\Exception $e) {
            Log::error('Certificate generation failed', [
                'student_id' => $user->id,
                'program_id' => $program->id,
                'language' => $language,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Certificate generation failed',
                'message' => 'Unable to generate certificate at this time. Please try again later.'
            ], 500);
        }
    }

    /**
     * Download certificate file
     */
    public function download(string $filename)
    {
        $user = Auth::user();
        
        if (!$user->hasRole('student')) {
            abort(403, 'Unauthorized');
        }

        // Security: Ensure filename belongs to the authenticated user
        $certificatePath = 'certificates/' . $filename;
        
        // Check if file exists using Storage or direct file access
        $fileExists = false;
        try {
            $fileExists = Storage::disk('private')->exists($certificatePath);
        } catch (\Exception $e) {
            // Fallback: check direct file system
            $fullPath = storage_path('app/private/' . $certificatePath);
            $fileExists = file_exists($fullPath);
        }
        
        if (!$fileExists) {
            abort(404, 'Certificate not found');
        }

        // Extract user ID from filename to verify ownership
        $filenameParts = explode('_', $filename);
        if (count($filenameParts) < 2 || $filenameParts[0] != $user->id) {
            abort(403, 'Access denied');
        }

        try {
            // Try Laravel Storage first, with fallback to direct file operations
            try {
                $file = Storage::disk('private')->get($certificatePath);
            } catch (\Exception $storageException) {
                // Fallback: direct file access
                $fullPath = storage_path('app/private/' . $certificatePath);
                if (!file_exists($fullPath)) {
                    abort(404, 'Certificate not found');
                }
                $file = file_get_contents($fullPath);
            }
            
            // Determine file type and MIME type
            $fileExtension = pathinfo($filename, PATHINFO_EXTENSION);
            switch ($fileExtension) {
                case 'pdf':
                    $mimeType = 'application/pdf';
                    break;
                case 'html':
                    $mimeType = 'text/html';
                    break;
                case 'png':
                default:
                    $mimeType = 'image/png';
                    break;
            }
            
            // Create a user-friendly download filename
            $programId = $filenameParts[1];
            $program = Program::find($programId);
            $baseDownloadName = 'Certificate_' . ($program ? $program->name : 'Program') . '_' . $user->first_name . '_' . $user->last_name;
            $downloadName = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $baseDownloadName) . '.' . $fileExtension;

            if ($fileExtension === 'html') {
                // For HTML certificates, display in browser instead of forcing download
                return response($file)
                    ->header('Content-Type', $mimeType)
                    ->header('Content-Length', strlen($file));
            } else {
                // For PDF/PNG, force download
                return response($file)
                    ->header('Content-Type', $mimeType)
                    ->header('Content-Disposition', 'attachment; filename="' . $downloadName . '"')
                    ->header('Content-Length', strlen($file));
            }
        } catch (\Exception $e) {
            Log::error('Certificate download failed', [
                'student_id' => $user->id,
                'filename' => $filename,
                'error' => $e->getMessage()
            ]);

            abort(500, 'Failed to download certificate');
        }
    }

    /**
     * View certificate in browser (for HTML certificates)
     */
    public function view(string $filename)
    {
        $user = Auth::user();
        
        if (!$user->hasRole('student')) {
            abort(403, 'Unauthorized');
        }

        // Security: Ensure filename belongs to the authenticated user
        $certificatePath = 'certificates/' . $filename;
        
        // Check if file exists and is HTML
        $fileExtension = pathinfo($filename, PATHINFO_EXTENSION);
        if ($fileExtension !== 'html') {
            return redirect()->route('certificates.download', ['filename' => $filename]);
        }
        
        // Check if file exists using Storage or direct file access
        $fileExists = false;
        $file = null;
        try {
            $fileExists = Storage::disk('private')->exists($certificatePath);
            if ($fileExists) {
                $file = Storage::disk('private')->get($certificatePath);
            }
        } catch (\Exception $e) {
            // Fallback: check direct file system
            $fullPath = storage_path('app/private/' . $certificatePath);
            $fileExists = file_exists($fullPath);
            if ($fileExists) {
                $file = file_get_contents($fullPath);
            }
        }
        
        if (!$fileExists || !$file) {
            abort(404, 'Certificate not found');
        }

        // Extract user ID from filename to verify ownership
        $filenameParts = explode('_', $filename);
        if (count($filenameParts) < 2 || $filenameParts[0] != $user->id) {
            abort(403, 'Access denied');
        }

        // Return HTML content directly
        return response($file)
            ->header('Content-Type', 'text/html; charset=UTF-8');
    }

    /**
     * Get available certificates for the authenticated student
     */
    public function index()
    {
        $user = Auth::user();
        
        if (!$user->hasRole('student')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $completedEnrollments = $user->enrollments()
            ->where('status', 'completed')
            ->with('program')
            ->get();

        $certificates = [];
        
        foreach ($completedEnrollments as $enrollment) {
            $existingCert = $this->certificateService->certificateExists($user, $enrollment->program);
            
            $certificates[] = [
                'program_id' => $enrollment->program->id,
                'program_name' => $enrollment->program->name,
                'completion_date' => $enrollment->completed_at?->format('F j, Y'),
                'levels_completed' => $enrollment->highest_unlocked_level ?? 0,
                'total_points' => $enrollment->quiz_points ?? 0,
                'certificate_exists' => $existingCert !== null,
                'download_url' => $existingCert ? $this->certificateService->getCertificateUrl($existingCert) : null,
                'can_generate' => true,
            ];
        }

        return response()->json([
            'certificates' => $certificates,
            'total_completed_programs' => count($certificates),
        ]);
    }

    /**
     * Check if program is completed and certificate can be generated
     */
    public function checkEligibility(Program $program)
    {
        $user = Auth::user();
        
        if (!$user->hasRole('student')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $enrollment = $user->enrollments()
            ->where('program_id', $program->id)
            ->first();

        if (!$enrollment) {
            return response()->json([
                'eligible' => false,
                'reason' => 'Not enrolled in this program',
                'progress' => 0,
            ]);
        }

        $isCompleted = $enrollment->status === 'completed';
        $existingCert = $isCompleted ? $this->certificateService->certificateExists($user, $program) : null;

        return response()->json([
            'eligible' => $isCompleted,
            'completed' => $isCompleted,
            'progress' => $enrollment->progress ?? 0,
            'levels_completed' => $enrollment->highest_unlocked_level ?? 0,
            'total_points' => $enrollment->quiz_points ?? 0,
            'completion_date' => $enrollment->completed_at?->format('F j, Y'),
            'certificate_exists' => $existingCert !== null,
            'download_url' => $existingCert ? $this->certificateService->getCertificateUrl($existingCert) : null,
            'reason' => $isCompleted ? 'Program completed' : 'Program not completed yet',
        ]);
    }
}