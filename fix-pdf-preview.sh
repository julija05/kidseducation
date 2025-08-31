#!/bin/bash

# Fix PDF Preview Issues
# This script fixes common PDF preview problems

echo "🔧 Fixing PDF preview issues..."

echo "Choose a fix option:"
echo "1. Fix MIME types for all PDF resources"
echo "2. Check and fix storage permissions"  
echo "3. Create test PDF resource"
echo "4. Fix specific PDF resource by ID"
echo "5. Enable PDF debug logging"
read -r OPTION

case $OPTION in
1)
    echo "🔄 Fixing MIME types for PDF resources..."
    php artisan tinker --execute="
    \$pdfResources = App\Models\LessonResource::where('file_name', 'LIKE', '%.pdf')
        ->orWhere('mime_type', 'LIKE', '%pdf%')
        ->get();
        
    echo 'Found ' . \$pdfResources->count() . ' PDF resources' . PHP_EOL;
    \$fixed = 0;
    
    foreach (\$pdfResources as \$resource) {
        if (\$resource->file_path && Storage::exists(\$resource->file_path)) {
            \$actualMimeType = Storage::mimeType(\$resource->file_path);
            
            if (\$resource->mime_type !== \$actualMimeType) {
                echo 'Fixing MIME type for: ' . \$resource->title . PHP_EOL;
                echo '  Old: ' . \$resource->mime_type . PHP_EOL;
                echo '  New: ' . \$actualMimeType . PHP_EOL;
                
                \$resource->update(['mime_type' => \$actualMimeType]);
                \$fixed++;
            }
        }
    }
    
    echo 'Fixed ' . \$fixed . ' MIME types' . PHP_EOL;
    "
    ;;

2)
    echo "🔄 Checking and fixing storage permissions..."
    
    # Fix storage permissions
    chmod -R 755 storage/
    chmod -R 775 storage/app/
    chmod -R 775 storage/logs/
    
    # Check if www-data user exists and set ownership
    if id "www-data" >/dev/null 2>&1; then
        chown -R www-data:www-data storage/
        echo "✅ Set www-data ownership"
    else
        echo "⚠️  www-data user not found - permissions set to 775"
    fi
    
    # Create lesson-resources directory if it doesn't exist
    if [ ! -d "storage/app/lesson-resources" ]; then
        mkdir -p storage/app/lesson-resources
        chmod 775 storage/app/lesson-resources
        echo "✅ Created lesson-resources directory"
    fi
    
    echo "✅ Storage permissions fixed"
    ;;

3)
    echo "🔄 Creating test PDF resource..."
    php artisan tinker --execute="
    // Create a simple test PDF content
    \$testPdfPath = 'lesson-resources/test/test-preview.pdf';
    
    // Create directory if it doesn't exist
    Storage::makeDirectory('lesson-resources/test');
    
    // Create a minimal PDF for testing
    \$pdfContent = '%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 24 Tf
100 700 Td
(Test PDF) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000120 00000 n 
0000000200 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF';
    
    Storage::put(\$testPdfPath, \$pdfContent);
    
    echo 'Created test PDF at: ' . \$testPdfPath . PHP_EOL;
    echo 'File size: ' . Storage::size(\$testPdfPath) . ' bytes' . PHP_EOL;
    echo 'MIME type: ' . Storage::mimeType(\$testPdfPath) . PHP_EOL;
    
    // Create test resource record
    \$testResource = App\Models\LessonResource::create([
        'lesson_id' => 1, // Assuming lesson 1 exists
        'title' => 'Test PDF Preview',
        'type' => 'document',
        'file_path' => \$testPdfPath,
        'file_name' => 'test-preview.pdf',
        'mime_type' => 'application/pdf',
        'file_size' => Storage::size(\$testPdfPath),
        'is_downloadable' => true,
        'order' => 999
    ]);
    
    echo 'Created test resource with ID: ' . \$testResource->id . PHP_EOL;
    echo 'Test URL: ' . route('lesson-resources.preview', \$testResource->id) . PHP_EOL;
    "
    ;;

4)
    echo "Enter the PDF resource ID to fix:"
    read -r RESOURCE_ID
    
    echo "🔄 Fixing PDF resource ID $RESOURCE_ID..."
    php artisan tinker --execute="
    \$resource = App\Models\LessonResource::find($RESOURCE_ID);
    
    if (!\$resource) {
        echo 'Resource not found: $RESOURCE_ID' . PHP_EOL;
        exit(1);
    }
    
    echo 'Resource: ' . \$resource->title . PHP_EOL;
    echo 'Current file path: ' . \$resource->file_path . PHP_EOL;
    echo 'Current MIME type: ' . \$resource->mime_type . PHP_EOL;
    
    if (\$resource->file_path) {
        if (Storage::exists(\$resource->file_path)) {
            echo 'File exists: YES' . PHP_EOL;
            
            // Update MIME type and file size
            \$actualMimeType = Storage::mimeType(\$resource->file_path);
            \$actualSize = Storage::size(\$resource->file_path);
            
            \$resource->update([
                'mime_type' => \$actualMimeType,
                'file_size' => \$actualSize
            ]);
            
            echo 'Updated MIME type: ' . \$actualMimeType . PHP_EOL;
            echo 'Updated file size: ' . \$actualSize . ' bytes' . PHP_EOL;
        } else {
            echo 'File exists: NO' . PHP_EOL;
            echo '❌ File not found in storage!' . PHP_EOL;
        }
    } else {
        echo '❌ No file path stored' . PHP_EOL;
    }
    "
    ;;

5)
    echo "🔄 Enabling PDF debug logging..."
    
    # Add temporary debug logging to ResourceAccessService
    cp app/Services/ResourceAccessService.php app/Services/ResourceAccessService.php.backup
    
    echo "Backup created. Adding debug logging..."
    echo "⚠️  Remember to restore after debugging: mv app/Services/ResourceAccessService.php.backup app/Services/ResourceAccessService.php"
    
    # This would require manual editing in practice
    echo "Manual step: Add Log::info statements to ResourceAccessService::serveFile method"
    echo "Example: Log::info('PDF Preview Debug', ['resource_id' => \$resource->id, 'file_path' => \$resource->file_path]);"
    ;;

*)
    echo "Invalid option"
    ;;
esac

echo "✅ PDF preview fix completed!"