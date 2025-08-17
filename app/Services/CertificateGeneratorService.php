<?php

namespace App\Services;

use App\Models\User;
use App\Models\Program;
use App\Models\Enrollment;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use TCPDF;

class CertificateGeneratorService
{
    private const CERTIFICATE_WIDTH = 1200;
    private const CERTIFICATE_HEIGHT = 850;
    
    /**
     * Certificate text translations
     */
    private const TRANSLATIONS = [
        'en' => [
            'title' => 'CERTIFICATE OF COMPLETION',
            'subtitle' => 'This certifies that',
            'achievement_text' => 'has successfully completed the program',
            'levels_completed' => 'Levels Completed',
            'total_points' => 'Total Points',
            'lessons_completed' => 'Lessons Completed',
            'date_of_completion' => 'Date of Completion',
            'educational_platform' => 'Educational Platform',
            'platform_name' => 'Abacoding - Kids Education Platform',
            'congratulations' => 'Congratulations on your achievement!',
            'certificate_id' => 'Certificate ID',
            'print_instruction_title' => 'Certificate Ready for Download',
            'print_instruction_text' => 'Use your browser\'s "Print" function and choose "Save as PDF" to download this certificate.',
            'print_instruction_shortcut' => 'Press Ctrl+P (Windows) or Cmd+P (Mac) to print/save as PDF'
        ],
        'mk' => [
            'title' => 'СЕРТИФИКАТ ЗА ЗАВРШУВАЊЕ',
            'subtitle' => 'Ова потврдува дека',
            'achievement_text' => 'успешно ја заврши програмата',
            'levels_completed' => 'Завршени Нивоа',
            'total_points' => 'Вкупно Поени',
            'lessons_completed' => 'Завршени Лекции',
            'date_of_completion' => 'Датум на Завршување',
            'educational_platform' => 'Образовна Платформа',
            'platform_name' => 'Абакодинг - Образовна Платформа за Деца',
            'congratulations' => 'Честитки за вашето достигнување!',
            'certificate_id' => 'ID на Сертификат',
            'print_instruction_title' => 'Сертификатот е Подготвен за Симнување',
            'print_instruction_text' => 'Користете ја функцијата "Печати" од вашиот прелистувач и изберете "Зачувај како PDF" за да го симнете сертификатот.',
            'print_instruction_shortcut' => 'Притиснете Ctrl+P (Windows) или Cmd+P (Mac) за печатење/зачувување како PDF'
        ]
    ];
    
    /**
     * Get translation for a given key and language
     */
    private function trans(string $key, string $language = 'en'): string
    {
        return self::TRANSLATIONS[$language][$key] ?? self::TRANSLATIONS['en'][$key] ?? $key;
    }
    
    /**
     * Generate a completion certificate for a student
     */
    public function generateCertificate(User $student, Program $program, string $language = 'en'): string
    {
        $enrollment = $student->enrollments()->where('program_id', $program->id)->first();
        
        if (!$enrollment || $enrollment->status !== 'completed') {
            throw new \Exception('Student has not completed this program');
        }

        // Create certificate content (image or HTML)
        $content = $this->createCertificateImage($student, $program, $enrollment, $language);
        
        // Save certificate
        $filename = $this->saveCertificate($content, $student, $program, $language);
        
        // Clean up memory if it's a GD resource or GdImage object
        if (is_resource($content) || ($content instanceof \GdImage)) {
            imagedestroy($content);
        }
        
        return $filename;
    }
    
    /**
     * Create the certificate content as HTML/PDF (fallback when GD not available)
     */
    private function createCertificateImage(User $student, Program $program, Enrollment $enrollment, string $language = 'en')
    {
        $gdAvailable = extension_loaded('gd');
        
        Log::info('Certificate generation method selection', [
            'gd_available' => $gdAvailable,
            'will_try' => 'PDF first, then ' . ($gdAvailable ? 'GD' : 'HTML') . ' fallback'
        ]);
        
        // Temporarily force HTML certificates until PDF issue is resolved
        Log::info('Using HTML certificate (PDF temporarily disabled for debugging)', [
            'language' => $language
        ]);
        return $this->createPrintableHTMLCertificate($student, $program, $enrollment, $language);
        
        /* PDF generation temporarily disabled for debugging
        try {
            return $this->createPDFCertificate($student, $program, $enrollment);
        } catch (\Exception $e) {
            Log::warning('PDF generation failed, using printable HTML fallback', [
                'error' => $e->getMessage()
            ]);
            
            return $this->createPrintableHTMLCertificate($student, $program, $enrollment);
        }
        */
    }

    /**
     * Create certificate as PDF using TCPDF
     */
    private function createPDFCertificate(User $student, Program $program, Enrollment $enrollment)
    {
        $fullName = trim($student->first_name . ' ' . $student->last_name);
        $completionDate = $enrollment->completed_at ? $enrollment->completed_at->format('F j, Y') : Carbon::now()->format('F j, Y');
        
        // Get total lessons count with fallback
        $totalLessons = method_exists($program, 'getTotalLessonsCount') 
            ? $program->getTotalLessonsCount() 
            : $program->lessons()->count();
            
        $completedLevels = $enrollment->highest_unlocked_level ?? 0;
        $totalPoints = $enrollment->quiz_points ?? 0;
        $certificateId = 'CERT-' . strtoupper(substr(md5($enrollment->id . $enrollment->user_id . $enrollment->program_id), 0, 8));

        // Create new PDF document with simplified settings
        $pdf = new TCPDF('L', 'mm', 'A4', true, 'UTF-8', false);
        
        // Set document information
        $pdf->SetCreator('Abacoding');
        $pdf->SetAuthor('Abacoding');
        $pdf->SetTitle('Certificate - ' . $fullName);
        
        // Remove default header/footer
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        
        // Set margins and auto page break
        $pdf->SetMargins(20, 20, 20);
        $pdf->SetAutoPageBreak(false, 0);
        
        // Add a page
        $pdf->AddPage();
        
        // Simple border
        $pdf->SetLineWidth(2);
        $pdf->SetDrawColor(218, 165, 32); // Gold
        $pdf->Rect(15, 15, 267, 180);
        
        // Title
        $pdf->SetFont('helvetica', 'B', 28);
        $pdf->SetTextColor(25, 55, 109); // Dark blue
        $pdf->SetXY(20, 40);
        $pdf->Cell(257, 15, 'CERTIFICATE OF COMPLETION', 0, 1, 'C');
        
        // Subtitle
        $pdf->SetFont('helvetica', '', 12);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->SetXY(20, 60);
        $pdf->Cell(257, 8, 'This certifies that', 0, 1, 'C');
        
        // Student name
        $pdf->SetFont('helvetica', 'B', 20);
        $pdf->SetTextColor(25, 55, 109);
        $pdf->SetXY(20, 80);
        $pdf->Cell(257, 12, $fullName, 0, 1, 'C');
        
        // Achievement text
        $pdf->SetFont('helvetica', '', 11);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->SetXY(20, 100);
        $pdf->Cell(257, 8, 'has successfully completed the program', 0, 1, 'C');
        
        // Program name
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->SetTextColor(59, 130, 246); // Light blue
        $pdf->SetXY(20, 115);
        $pdf->Cell(257, 10, $program->name, 0, 1, 'C');
        
        // Statistics in simple text format
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->SetXY(20, 140);
        $pdf->Cell(257, 6, 'Levels Completed: ' . $completedLevels . ' | Total Points: ' . $totalPoints . ' | Lessons: ' . $totalLessons, 0, 1, 'C');
        
        // Completion date
        $pdf->SetXY(20, 155);
        $pdf->Cell(257, 6, 'Date of Completion: ' . $completionDate, 0, 1, 'C');
        
        // Platform
        $pdf->SetXY(20, 165);
        $pdf->Cell(257, 6, 'Abacoding - Kids Education Platform', 0, 1, 'C');
        
        // Congratulations
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->SetTextColor(218, 165, 32); // Gold
        $pdf->SetXY(20, 180);
        $pdf->Cell(257, 8, 'Congratulations on your achievement!', 0, 1, 'C');
        
        // Certificate ID
        $pdf->SetFont('helvetica', '', 8);
        $pdf->SetTextColor(150, 150, 150);
        $pdf->SetXY(20, 190);
        $pdf->Cell(257, 5, 'Certificate ID: ' . $certificateId, 0, 1, 'C');
        
        // Return PDF content as string
        return $pdf->Output('', 'S');
    }

    /**
     * Create certificate using GD library
     */
    private function createGDCertificate(User $student, Program $program, Enrollment $enrollment)
    {
        // Create image
        $image = imagecreatetruecolor(self::CERTIFICATE_WIDTH, self::CERTIFICATE_HEIGHT);
        
        // Colors
        $white = imagecolorallocate($image, 255, 255, 255);
        $gold = imagecolorallocate($image, 218, 165, 32);
        $darkBlue = imagecolorallocate($image, 25, 55, 109);
        $lightBlue = imagecolorallocate($image, 59, 130, 246);
        $gray = imagecolorallocate($image, 75, 85, 99);
        $darkGray = imagecolorallocate($image, 31, 41, 55);
        
        // Fill background
        imagefill($image, 0, 0, $white);
        
        // Add decorative border
        $this->addBorder($image, $gold, $lightBlue);
        
        // Add header
        $this->addHeader($image, $darkBlue, $gold);
        
        // Add main content
        $this->addStudentInfo($image, $student, $darkBlue, $gray);
        $this->addProgramInfo($image, $program, $enrollment, $darkBlue, $lightBlue);
        
        // Add footer
        $this->addFooter($image, $gray, $enrollment);
        
        return $image;
    }

    /**
     * Create certificate as HTML/SVG when GD is not available
     */
    private function createHTMLCertificate(User $student, Program $program, Enrollment $enrollment)
    {
        $fullName = trim($student->first_name . ' ' . $student->last_name);
        $completionDate = $enrollment->completed_at ? $enrollment->completed_at->format('F j, Y') : Carbon::now()->format('F j, Y');
        
        // Get total lessons count with fallback
        $totalLessons = method_exists($program, 'getTotalLessonsCount') 
            ? $program->getTotalLessonsCount() 
            : $program->lessons()->count();
            
        $completedLevels = $enrollment->highest_unlocked_level ?? 0;
        $totalPoints = $enrollment->quiz_points ?? 0;
        $certificateId = 'CERT-' . strtoupper(substr(md5($enrollment->id . $enrollment->user_id . $enrollment->program_id), 0, 8));

        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Certificate of Completion</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .certificate { 
            background: white; 
            padding: 60px; 
            border-radius: 20px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center; 
            max-width: 800px; 
            border: 8px solid #DAA520;
            position: relative;
        }
        .certificate::before {
            content: "";
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 3px solid #3B82F6;
            border-radius: 12px;
        }
        .header { 
            color: #1a365d; 
            margin-bottom: 30px; 
            position: relative;
            z-index: 1;
        }
        .title { 
            font-size: 48px; 
            font-weight: bold; 
            margin-bottom: 10px; 
            color: #1a365d;
        }
        .subtitle { 
            font-size: 18px; 
            color: #DAA520; 
            margin-bottom: 30px; 
        }
        .student-name { 
            font-size: 36px; 
            font-weight: bold; 
            color: #1a365d; 
            margin: 30px 0; 
            text-decoration: underline;
            text-decoration-color: #DAA520;
        }
        .program-name { 
            font-size: 28px; 
            color: #3B82F6; 
            font-weight: bold; 
            margin: 20px 0; 
        }
        .details { 
            margin: 30px 0; 
            font-size: 16px; 
            color: #1a365d; 
        }
        .stats { 
            display: flex; 
            justify-content: space-around; 
            margin: 30px 0; 
            padding: 20px;
            background: #f8fafc;
            border-radius: 10px;
        }
        .stat { 
            text-align: center; 
        }
        .stat-value { 
            font-size: 24px; 
            font-weight: bold; 
            color: #1a365d; 
        }
        .stat-label { 
            font-size: 12px; 
            color: #718096; 
            text-transform: uppercase; 
        }
        .footer { 
            margin-top: 40px; 
            font-size: 14px; 
            color: #718096; 
        }
        .cert-id { 
            font-size: 12px; 
            color: #a0aec0; 
            margin-top: 20px; 
        }
        .emoji { 
            font-size: 48px; 
            margin: 20px; 
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <div class="title">🎓 CERTIFICATE OF COMPLETION</div>
            <div class="subtitle">This certifies that</div>
        </div>
        
        <div class="student-name">' . htmlspecialchars($fullName) . '</div>
        
        <div style="font-size: 18px; color: #718096; margin: 20px 0;">
            has successfully completed the
        </div>
        
        <div class="program-name">' . htmlspecialchars($program->name) . '</div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-value">' . $completedLevels . '</div>
                <div class="stat-label">Levels Completed</div>
            </div>
            <div class="stat">
                <div class="stat-value">' . $totalPoints . '</div>
                <div class="stat-label">Total Points</div>
            </div>
            <div class="stat">
                <div class="stat-value">' . $totalLessons . '</div>
                <div class="stat-label">Lessons Completed</div>
            </div>
        </div>
        
        <div class="details">
            <strong>Date of Completion:</strong> ' . $completionDate . '<br>
            <strong>Platform:</strong> Abacoding - Kids Education Platform
        </div>
        
        <div class="emoji">🎉 ⭐ 🏆 ⭐ 🎉</div>
        
        <div class="footer">
            <div><strong>Congratulations on your achievement!</strong></div>
            <div class="cert-id">Certificate ID: ' . $certificateId . '</div>
        </div>
    </div>
</body>
</html>';

        return $html;
    }

    /**
     * Create a high-quality printable HTML certificate (can be saved as PDF by browser)
     */
    private function createPrintableHTMLCertificate(User $student, Program $program, Enrollment $enrollment, string $language = 'en')
    {
        $fullName = trim($student->first_name . ' ' . $student->last_name);
        $completionDate = $enrollment->completed_at ? $enrollment->completed_at->format('F j, Y') : Carbon::now()->format('F j, Y');
        
        // Get total lessons count with fallback
        $totalLessons = method_exists($program, 'getTotalLessonsCount') 
            ? $program->getTotalLessonsCount() 
            : $program->lessons()->count();
            
        $completedLevels = $enrollment->highest_unlocked_level ?? 0;
        $totalPoints = $enrollment->quiz_points ?? 0;
        $certificateId = 'CERT-' . strtoupper(substr(md5($enrollment->id . $enrollment->user_id . $enrollment->program_id), 0, 8));

        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>' . htmlspecialchars($this->trans('title', $language)) . ' - ' . htmlspecialchars($fullName) . '</title>
    <style>
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap");
        
        @page {
            size: A4 landscape;
            margin: 0;
        }
        
        @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none; }
        }
        
        body { 
            font-family: "Inter", sans-serif;
            margin: 0; 
            padding: 20px; 
            background: #f9fafb;
            color: #111827;
            line-height: 1.5;
        }
        
        .certificate { 
            width: 277mm;
            height: 190mm;
            background: white;
            position: relative;
            box-sizing: border-box;
            margin: 0 auto;
            page-break-inside: avoid;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            border: 1px solid #e5e7eb;
            overflow: hidden;
        }
        
        /* Elegant border design */
        .certificate::before {
            content: "";
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
            border: 3px solid #1f2937;
            border-radius: 2px;
            z-index: 1;
        }
        
        .certificate::after {
            content: "";
            position: absolute;
            top: 25px;
            left: 25px;
            right: 25px;
            bottom: 25px;
            border: 1px solid #d1d5db;
            z-index: 1;
        }
        
        /* Header with logo and institution */
        .header {
            padding: 35px 50px 15px;
            text-align: center;
            position: relative;
            z-index: 10;
        }
        
        .logo-section {
            margin-bottom: 20px;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #3b82f6, #1e40af);
            border-radius: 50%;
            margin: 0 auto 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 28px;
            font-weight: 700;
            font-family: "Playfair Display", serif;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .institution-name {
            font-size: 16px;
            color: #374151;
            font-weight: 600;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .institution-subtitle {
            font-size: 12px;
            color: #6b7280;
            font-weight: 400;
        }
        
        /* Main content area */
        .content {
            padding: 10px 60px 30px;
            text-align: center;
            position: relative;
            z-index: 10;
        }
        
        .certificate-type {
            font-size: 14px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 10px;
            font-weight: 500;
        }
        
        .title { 
            font-family: "Playfair Display", serif;
            font-size: 36px; 
            font-weight: 700; 
            color: #1f2937;
            margin: 0 0 20px 0;
            letter-spacing: 1px;
            line-height: 1.1;
        }
        
        .subtitle-section {
            margin: 25px 0;
        }
        
        .subtitle { 
            font-size: 18px; 
            color: #4b5563; 
            margin-bottom: 15px; 
            font-weight: 400;
            font-style: italic;
        }
        
        .student-name { 
            font-family: "Playfair Display", serif;
            font-size: 32px; 
            font-weight: 600; 
            color: #1f2937;
            margin: 20px 0; 
            position: relative;
            line-height: 1.2;
            text-decoration: underline;
            text-decoration-color: #3b82f6;
            text-decoration-thickness: 2px;
            text-underline-offset: 6px;
        }
        
        .achievement-section {
            margin: 25px 0;
        }
        
        .achievement-text {
            font-size: 16px;
            color: #374151;
            margin-bottom: 15px;
            font-weight: 400;
            line-height: 1.5;
        }
        
        .program-name { 
            font-size: 22px; 
            color: #1f2937; 
            font-weight: 600; 
            margin: 15px 0 25px 0;
            font-family: "Playfair Display", serif;
            font-style: italic;
        }
        
        /* Statistics in clean row format */
        .achievement-details {
            margin: 25px 0;
            display: flex;
            justify-content: center;
            gap: 40px;
            flex-wrap: wrap;
        }
        
        .detail-item {
            text-align: center;
            min-width: 100px;
        }
        
        .detail-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .detail-value {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            font-family: "Playfair Display", serif;
        }
        
        /* Completion details */
        .completion-details {
            margin: 25px 0 15px 0;
            padding: 15px 20px;
            background: #f9fafb;
            border-left: 3px solid #3b82f6;
            text-align: center;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .completion-details p {
            margin: 5px 0;
            font-size: 14px;
            color: #374151;
            line-height: 1.5;
        }
        
        .completion-details strong {
            color: #1f2937;
            font-weight: 600;
        }
        
        /* Certificate ID */
        .cert-id {
            position: absolute;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 11px;
            color: #9ca3af;
            font-weight: 500;
            letter-spacing: 1px;
            z-index: 10;
        }
        
        /* Decorative elements - positioned within borders */
        .corner-ornament {
            position: absolute;
            width: 40px;
            height: 40px;
            z-index: 5;
        }
        
        .corner-ornament::before,
        .corner-ornament::after {
            content: "";
            position: absolute;
            background: #d1d5db;
        }
        
        .corner-ornament::before {
            width: 40px;
            height: 1px;
            top: 19px;
            left: 0;
        }
        
        .corner-ornament::after {
            width: 1px;
            height: 40px;
            top: 0;
            left: 19px;
        }
        
        .corner-top-left {
            top: 35px;
            left: 35px;
        }
        
        .corner-top-right {
            top: 35px;
            right: 35px;
        }
        
        .corner-bottom-left {
            bottom: 35px;
            left: 35px;
        }
        
        .corner-bottom-right {
            bottom: 35px;
            right: 35px;
        }
        
        .print-instruction {
            text-align: center;
            padding: 20px;
            background: #eff6ff;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            margin-bottom: 20px;
            color: #1e40af;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="print-instruction no-print">
        <strong>📄 ' . htmlspecialchars($this->trans('print_instruction_title', $language)) . '</strong><br>
        ' . htmlspecialchars($this->trans('print_instruction_text', $language)) . '
        <br><small>' . htmlspecialchars($this->trans('print_instruction_shortcut', $language)) . '</small>
    </div>
    
    <div class="certificate">
        <!-- Corner ornaments -->
        <div class="corner-ornament corner-top-left"></div>
        <div class="corner-ornament corner-top-right"></div>
        <div class="corner-ornament corner-bottom-left"></div>
        <div class="corner-ornament corner-bottom-right"></div>
        
        <!-- Header Section -->
        <div class="header">
            <div class="logo-section">
                <div class="logo">A</div>
                <div class="institution-name">Abacoding</div>
                <div class="institution-subtitle">' . htmlspecialchars($this->trans('platform_name', $language)) . '</div>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <div class="certificate-type">' . htmlspecialchars($this->trans('title', $language)) . '</div>
            
            <div class="subtitle-section">
                <div class="subtitle">' . htmlspecialchars($this->trans('subtitle', $language)) . '</div>
                <div class="student-name">' . htmlspecialchars($fullName) . '</div>
            </div>
            
            <div class="achievement-section">
                <div class="achievement-text">' . htmlspecialchars($this->trans('achievement_text', $language)) . '</div>
                <div class="program-name">' . htmlspecialchars($program->name) . '</div>
            </div>
            
            <div class="achievement-details">
                <div class="detail-item">
                    <div class="detail-label">' . htmlspecialchars($this->trans('levels_completed', $language)) . '</div>
                    <div class="detail-value">' . $completedLevels . '</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">' . htmlspecialchars($this->trans('total_points', $language)) . '</div>
                    <div class="detail-value">' . $totalPoints . '</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">' . htmlspecialchars($this->trans('lessons_completed', $language)) . '</div>
                    <div class="detail-value">' . $totalLessons . '</div>
                </div>
            </div>
            
            <div class="completion-details">
                <p><strong>' . htmlspecialchars($this->trans('date_of_completion', $language)) . ':</strong> ' . $completionDate . '</p>
                <p><strong>' . htmlspecialchars($this->trans('congratulations', $language)) . '</strong></p>
            </div>
        </div>
        
        <!-- Certificate ID -->
        <div class="cert-id">' . htmlspecialchars($this->trans('certificate_id', $language)) . ': ' . $certificateId . '</div>
    </div>
</body>
</html>';

        return $html;
    }
    
    /**
     * Add decorative border to certificate
     */
    private function addBorder($image, $gold, $lightBlue): void
    {
        $thickness = 8;
        
        // Outer gold border
        for ($i = 0; $i < $thickness; $i++) {
            imagerectangle($image, $i, $i, self::CERTIFICATE_WIDTH - 1 - $i, self::CERTIFICATE_HEIGHT - 1 - $i, $gold);
        }
        
        // Inner blue border
        for ($i = $thickness + 5; $i < $thickness + 8; $i++) {
            imagerectangle($image, $i, $i, self::CERTIFICATE_WIDTH - 1 - $i, self::CERTIFICATE_HEIGHT - 1 - $i, $lightBlue);
        }
    }
    
    /**
     * Add certificate header
     */
    private function addHeader($image, $darkBlue, $gold): void
    {
        // Certificate title
        $this->addText($image, 'CERTIFICATE OF COMPLETION', 600, 80, 32, $darkBlue, true);
        
        // Subtitle
        $this->addText($image, 'This certifies that', 600, 130, 18, $gold, true);
    }
    
    /**
     * Add student information
     */
    private function addStudentInfo($image, User $student, $darkBlue, $gray): void
    {
        // Student name (large, prominent)
        $fullName = trim($student->first_name . ' ' . $student->last_name);
        $this->addText($image, $fullName, 600, 200, 36, $darkBlue, true, true);
        
        // Achievement text
        $this->addText($image, 'has successfully completed the', 600, 260, 18, $gray, true);
    }
    
    /**
     * Add program information
     */
    private function addProgramInfo($image, Program $program, Enrollment $enrollment, $darkBlue, $lightBlue): void
    {
        // Program name
        $programName = $program->name;
        $this->addText($image, $programName, 600, 320, 28, $lightBlue, true, true);
        
        // Program details
        $totalLessons = method_exists($program, 'getTotalLessonsCount') 
            ? $program->getTotalLessonsCount() 
            : $program->lessons()->count();
        $completedLevels = $enrollment->highest_unlocked_level ?? 0;
        $totalPoints = $enrollment->quiz_points ?? 0;
        
        $detailsY = 380;
        
        // Levels completed
        if ($completedLevels > 0) {
            $this->addText($image, "Levels Completed: {$completedLevels}", 600, $detailsY, 16, $darkBlue, true);
            $detailsY += 35;
        }
        
        // Total points earned
        if ($totalPoints > 0) {
            $this->addText($image, "Total Points Earned: {$totalPoints}", 600, $detailsY, 16, $darkBlue, true);
            $detailsY += 35;
        }
        
        // Total lessons
        if ($totalLessons > 0) {
            $this->addText($image, "Lessons Completed: {$totalLessons}", 600, $detailsY, 16, $darkBlue, true);
        }
    }
    
    /**
     * Add certificate footer
     */
    private function addFooter($image, $gray, Enrollment $enrollment): void
    {
        $completionDate = $enrollment->completed_at ? $enrollment->completed_at->format('F j, Y') : Carbon::now()->format('F j, Y');
        
        // Date
        $this->addText($image, "Date of Completion: {$completionDate}", 600, 550, 14, $gray, true);
        
        // Platform name
        $this->addText($image, 'Abacoding - Kids Education Platform', 600, 580, 14, $gray, true);
        
        // Certificate ID (for verification)
        $certificateId = 'CERT-' . strtoupper(substr(md5($enrollment->id . $enrollment->user_id . $enrollment->program_id), 0, 8));
        $this->addText($image, "Certificate ID: {$certificateId}", 600, 610, 12, $gray, true);
        
        // Congratulations message
        $this->addText($image, '🎉 Congratulations on your achievement! 🎉', 600, 700, 16, $gray, true);
        
        // Add decorative elements
        $this->addDecorations($image, $gray);
    }
    
    /**
     * Add decorative elements to the certificate
     */
    private function addDecorations($image, $color): void
    {
        // Add some decorative stars
        $stars = ['⭐', '🌟', '✨', '🎓'];
        
        // Top decorations
        $this->addText($image, $stars[0], 150, 150, 24, $color);
        $this->addText($image, $stars[1], 1050, 150, 24, $color);
        
        // Bottom decorations
        $this->addText($image, $stars[2], 150, 650, 24, $color);
        $this->addText($image, $stars[3], 1050, 650, 24, $color);
    }
    
    /**
     * Add text to image with UTF-8 support
     */
    private function addText($image, string $text, int $x, int $y, int $size, $color, bool $center = false, bool $bold = false): void
    {
        // For now, use imagestring since we may not have TTF fonts available
        // In production, you'd want to use imagettftext with proper fonts
        
        $fontSize = max(1, min(5, intval($size / 6))); // Convert size to GD font size (1-5)
        
        if ($center) {
            $textWidth = imagefontwidth($fontSize) * strlen($text);
            $x = $x - ($textWidth / 2);
        }
        
        // For bold effect, write text multiple times with slight offset
        if ($bold) {
            imagestring($image, $fontSize, $x + 1, $y, $text, $color);
            imagestring($image, $fontSize, $x, $y + 1, $text, $color);
            imagestring($image, $fontSize, $x + 1, $y + 1, $text, $color);
        }
        
        imagestring($image, $fontSize, $x, $y, $text, $color);
    }
    
    /**
     * Save certificate to storage
     */
    private function saveCertificate($content, User $student, Program $program, string $language = 'en'): string
    {
        try {
            // Detect content type more reliably
            $isGdResource = (is_resource($content) && get_resource_type($content) === 'gd') || 
                           ($content instanceof \GdImage);
            $isPdfContent = is_string($content) && (strpos($content, '%PDF-') === 0);
            $isHtmlContent = is_string($content) && (strpos($content, '<!DOCTYPE') === 0);
            
            Log::info('Certificate save starting', [
                'content_type' => gettype($content),
                'content_class' => is_object($content) ? get_class($content) : 'N/A',
                'is_gd_resource' => $isGdResource,
                'is_string' => is_string($content),
                'is_gdimage' => $content instanceof \GdImage,
                'is_pdf_content' => $isPdfContent,
                'is_html_content' => $isHtmlContent,
                'content_preview' => is_string($content) ? substr($content, 0, 50) . '...' : 'N/A'
            ]);
            
            if ($isGdResource) {
                // Handle GD image resource
                $filename = 'certificates/' . $student->id . '_' . $program->id . '_' . $language . '_' . time() . '.png';
                
                // Create temporary file
                $tempPath = storage_path('app/temp_cert.png');
                imagepng($content, $tempPath);
                
                // Store in Laravel storage
                $fileContents = file_get_contents($tempPath);
                
                try {
                    Storage::disk('private')->put($filename, $fileContents);
                } catch (\Exception $storageException) {
                    Log::warning('Laravel Storage failed for image, using direct file operations', [
                        'storage_error' => $storageException->getMessage()
                    ]);
                    
                    // Fallback: use direct file operations
                    $fullPath = storage_path('app/private/' . $filename);
                    $directory = dirname($fullPath);
                    
                    // Ensure directory exists
                    if (!is_dir($directory)) {
                        mkdir($directory, 0755, true);
                    }
                    
                    // Copy file directly
                    if (!copy($tempPath, $fullPath)) {
                        throw new \Exception('Failed to copy certificate file using direct file operations');
                    }
                    
                    Log::info('Certificate image saved using direct file operations', ['path' => $fullPath]);
                }
                
                // Clean up temp file
                unlink($tempPath);
            } elseif ($isPdfContent) {
                // Handle PDF content
                $filename = 'certificates/' . $student->id . '_' . $program->id . '_' . $language . '_' . time() . '.pdf';
                
                Log::info('Attempting to save PDF certificate', [
                    'filename' => $filename,
                    'content_length' => strlen($content),
                    'disk' => 'private'
                ]);
                
                // Try Laravel Storage first, with fallback to direct file operations
                try {
                    Storage::disk('private')->put($filename, $content);
                } catch (\Exception $storageException) {
                    Log::warning('Laravel Storage failed, using direct file operations', [
                        'storage_error' => $storageException->getMessage()
                    ]);
                    
                    // Fallback: use direct file operations
                    $fullPath = storage_path('app/private/' . $filename);
                    $directory = dirname($fullPath);
                    
                    // Ensure directory exists
                    if (!is_dir($directory)) {
                        mkdir($directory, 0755, true);
                    }
                    
                    // Write file directly
                    if (file_put_contents($fullPath, $content) === false) {
                        throw new \Exception('Failed to write PDF certificate file using direct file operations');
                    }
                    
                    Log::info('PDF certificate saved using direct file operations', ['path' => $fullPath]);
                }
            } else {
                // Handle HTML content (string)
                $filename = 'certificates/' . $student->id . '_' . $program->id . '_' . $language . '_' . time() . '.html';
                
                if (!is_string($content)) {
                    throw new \Exception('Expected string content for HTML certificate, got: ' . gettype($content));
                }
                
                Log::info('Attempting to save HTML certificate', [
                    'filename' => $filename,
                    'content_length' => strlen($content),
                    'disk' => 'private'
                ]);
                
                // Try Laravel Storage first, with fallback to direct file operations
                try {
                    Storage::disk('private')->put($filename, $content);
                } catch (\Exception $storageException) {
                    Log::warning('Laravel Storage failed, using direct file operations', [
                        'storage_error' => $storageException->getMessage()
                    ]);
                    
                    // Fallback: use direct file operations
                    $fullPath = storage_path('app/private/' . $filename);
                    $directory = dirname($fullPath);
                    
                    // Ensure directory exists
                    if (!is_dir($directory)) {
                        mkdir($directory, 0755, true);
                    }
                    
                    // Write file directly
                    if (file_put_contents($fullPath, $content) === false) {
                        throw new \Exception('Failed to write certificate file using direct file operations');
                    }
                    
                    Log::info('Certificate saved using direct file operations', ['path' => $fullPath]);
                }
            }
            
            Log::info('Certificate generated successfully', [
                'student_id' => $student->id,
                'program_id' => $program->id,
                'filename' => $filename,
                'type' => $isGdResource ? 'image' : 'html'
            ]);
            
            return $filename;
            
        } catch (\Exception $e) {
            Log::error('Certificate save failed', [
                'student_id' => $student->id,
                'program_id' => $program->id,
                'error' => $e->getMessage(),
                'content_type' => gettype($content),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
    
    /**
     * Get certificate download URL
     */
    public function getCertificateUrl(string $filename): string
    {
        return route('certificates.download', ['filename' => basename($filename)]);
    }
    
    /**
     * Check if certificate exists for student and program
     */
    public function certificateExists(User $student, Program $program): ?string
    {
        $basePath = 'certificates/' . $student->id . '_' . $program->id . '_*';
        $patterns = [
            $basePath . '.pdf',   // PDF has priority
            $basePath . '.png',
            $basePath . '.html'
        ];
        
        try {
            // Try Laravel Storage first
            $files = Storage::disk('private')->files('certificates');
            
            foreach ($patterns as $pattern) {
                foreach ($files as $file) {
                    if (fnmatch($pattern, $file)) {
                        return $file;
                    }
                }
            }
        } catch (\Exception $storageException) {
            // Fallback: direct directory scan
            $certificatesDir = storage_path('app/private/certificates');
            if (is_dir($certificatesDir)) {
                $files = scandir($certificatesDir);
                foreach ($files as $file) {
                    if ($file === '.' || $file === '..') continue;
                    
                    $filePath = 'certificates/' . $file;
                    foreach ($patterns as $pattern) {
                        if (fnmatch($pattern, $filePath)) {
                            return $filePath;
                        }
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * Generate or get existing certificate
     */
    public function getOrGenerateCertificate(User $student, Program $program, string $language = 'en'): string
    {
        // Clean up old certificates first to ensure we get the latest format
        $this->cleanupOldCertificates($student, $program);
        
        // Always generate a new certificate to ensure latest format
        return $this->generateCertificate($student, $program, $language);
    }
    
    /**
     * Clean up old certificates for a student/program
     */
    private function cleanupOldCertificates(User $student, Program $program): void
    {
        $basePath = 'certificates/' . $student->id . '_' . $program->id . '_*';
        $patterns = [
            $basePath . '.pdf',
            $basePath . '.png',
            $basePath . '.html'
        ];
        
        try {
            $files = Storage::disk('private')->files('certificates');
            foreach ($files as $file) {
                foreach ($patterns as $pattern) {
                    if (fnmatch($pattern, $file)) {
                        Storage::disk('private')->delete($file);
                        Log::info('Cleaned up old certificate', ['file' => $file]);
                    }
                }
            }
        } catch (\Exception $e) {
            Log::warning('Could not clean up old certificates', ['error' => $e->getMessage()]);
        }
    }
}