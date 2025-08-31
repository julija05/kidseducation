#!/bin/bash

# Debug PDF Resource Issues
# This script specifically diagnoses PDF preview problems

echo "🔍 Debugging PDF resource issues..."

# Check all PDF resources in the system
php artisan tinker --execute="
echo 'Finding all PDF resources...' . PHP_EOL;

\$pdfResources = App\Models\LessonResource::where('mime_type', 'LIKE', '%pdf%')
    ->orWhere('type', 'document')
    ->orWhere('file_name', 'LIKE', '%.pdf')
    ->with(['lesson.program'])
    ->get();

echo 'Found ' . \$pdfResources->count() . ' potential PDF resources' . PHP_EOL . PHP_EOL;

foreach (\$pdfResources as \$resource) {
    echo 'Resource ID: ' . \$resource->id . PHP_EOL;
    echo '  Title: ' . \$resource->title . PHP_EOL;
    echo '  Type: ' . \$resource->type . PHP_EOL;
    echo '  File Name: ' . \$resource->file_name . PHP_EOL;
    echo '  File Path: ' . \$resource->file_path . PHP_EOL;
    echo '  MIME Type: ' . \$resource->mime_type . PHP_EOL;
    echo '  File Size: ' . \$resource->file_size . PHP_EOL;
    
    if (\$resource->lesson) {
        echo '  Lesson: ' . \$resource->lesson->title . PHP_EOL;
        if (\$resource->lesson->program) {
            echo '  Program: ' . \$resource->lesson->program->name . PHP_EOL;
        }
    }
    
    // Check if file exists in storage
    if (\$resource->file_path) {
        \$exists = Storage::exists(\$resource->file_path);
        echo '  File Exists: ' . (\$exists ? 'YES' : 'NO') . PHP_EOL;
        
        if (\$exists) {
            try {
                \$size = Storage::size(\$resource->file_path);
                \$actualMimeType = Storage::mimeType(\$resource->file_path);
                echo '  Actual File Size: ' . \$size . ' bytes' . PHP_EOL;
                echo '  Actual MIME Type: ' . \$actualMimeType . PHP_EOL;
                
                // Check if MIME types match
                if (\$resource->mime_type !== \$actualMimeType) {
                    echo '  ⚠️  MIME TYPE MISMATCH!' . PHP_EOL;
                }
            } catch (Exception \$e) {
                echo '  ERROR reading file: ' . \$e->getMessage() . PHP_EOL;
            }
        } else {
            echo '  ❌ FILE NOT FOUND IN STORAGE!' . PHP_EOL;
        }
    } else {
        echo '  No file path stored' . PHP_EOL;
    }
    
    // Test URL generation
    try {
        \$previewUrl = route('lesson-resources.preview', \$resource->id);
        echo '  Preview URL: ' . \$previewUrl . PHP_EOL;
    } catch (Exception \$e) {
        echo '  Error generating URL: ' . \$e->getMessage() . PHP_EOL;
    }
    
    echo PHP_EOL;
}

// Check specific resource 2 if it exists
echo 'Checking specific resource ID 2...' . PHP_EOL;
\$resource2 = App\Models\LessonResource::find(2);
if (\$resource2) {
    echo 'Resource 2 found - checking file access...' . PHP_EOL;
    
    if (\$resource2->file_path) {
        echo 'File path: ' . \$resource2->file_path . PHP_EOL;
        
        // Try to get file content to see if there are permission issues
        try {
            \$content = Storage::get(\$resource2->file_path);
            echo 'File readable: YES (' . strlen(\$content) . ' bytes)' . PHP_EOL;
        } catch (Exception \$e) {
            echo 'File read error: ' . \$e->getMessage() . PHP_EOL;
        }
    }
} else {
    echo 'Resource 2 not found' . PHP_EOL;
}
"

echo ""
echo "📁 Checking storage directory permissions..."

# Check if storage directory exists and is readable
if [ -d "storage/app" ]; then
    echo "✅ storage/app directory exists"
    ls -la storage/app/ | head -5
else
    echo "❌ storage/app directory not found"
fi

# Check for lesson-resources directory
if [ -d "storage/app/lesson-resources" ]; then
    echo "✅ lesson-resources directory exists"
    echo "File count in lesson-resources:"
    find storage/app/lesson-resources -name "*.pdf" | wc -l
else
    echo "❌ lesson-resources directory not found"
fi

echo ""
echo "🔍 PDF resource debug completed!"
echo ""
echo "Common PDF issues and fixes:"
echo "1. File not found -> Check file upload process"
echo "2. MIME type mismatch -> Update mime_type in database"
echo "3. Permission denied -> Check storage/app permissions"
echo "4. Path incorrect -> Verify file_path in database"