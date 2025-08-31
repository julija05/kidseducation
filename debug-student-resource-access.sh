#!/bin/bash

# Debug Student Resource Access
# Run this on your production server to diagnose 403 issues

echo "🔍 Debugging student resource access issues..."

# You'll need to replace these with actual values from your system
echo "Enter student email (or user ID):"
read -r STUDENT_IDENTIFIER

echo "Enter lesson resource ID that's giving 403:"
read -r RESOURCE_ID

# Test 1: Check user exists and has student role
echo "📋 Test 1: Checking student user..."
php artisan tinker --execute="
\$user = App\Models\User::where('email', '$STUDENT_IDENTIFIER')
    ->orWhere('id', '$STUDENT_IDENTIFIER')
    ->first();

if (\$user) {
    echo 'User found: ID=' . \$user->id . ', Email=' . \$user->email . PHP_EOL;
    echo 'Has student role: ' . (\$user->hasRole('student') ? 'YES' : 'NO') . PHP_EOL;
    echo 'Is demo account: ' . (\$user->isDemoAccount() ? 'YES' : 'NO') . PHP_EOL;
} else {
    echo 'User NOT found with identifier: $STUDENT_IDENTIFIER' . PHP_EOL;
    exit(1);
}
"

# Test 2: Check lesson resource exists
echo "📋 Test 2: Checking lesson resource..."
php artisan tinker --execute="
\$resource = App\Models\LessonResource::find($RESOURCE_ID);
if (\$resource) {
    echo 'Resource found: ID=' . \$resource->id . ', Title=' . \$resource->title . PHP_EOL;
    echo 'Lesson ID: ' . \$resource->lesson_id . PHP_EOL;
    echo 'Program ID: ' . \$resource->lesson->program_id . PHP_EOL;
    echo 'Program name: ' . \$resource->lesson->program->name . PHP_EOL;
} else {
    echo 'Resource NOT found with ID: $RESOURCE_ID' . PHP_EOL;
    exit(1);
}
"

# Test 3: Check student enrollment
echo "📋 Test 3: Checking student enrollment..."
php artisan tinker --execute="
\$user = App\Models\User::where('email', '$STUDENT_IDENTIFIER')
    ->orWhere('id', '$STUDENT_IDENTIFIER')->first();
\$resource = App\Models\LessonResource::find($RESOURCE_ID);

if (\$user && \$resource) {
    \$programId = \$resource->lesson->program_id;
    echo 'Checking enrollment for program ID: ' . \$programId . PHP_EOL;
    
    \$enrollment = \$user->enrollments()
        ->where('program_id', \$programId)
        ->first();
    
    if (\$enrollment) {
        echo 'Enrollment found:' . PHP_EOL;
        echo '  Status: ' . \$enrollment->status . PHP_EOL;
        echo '  Approval Status: ' . \$enrollment->approval_status . PHP_EOL;
        echo '  Created: ' . \$enrollment->created_at . PHP_EOL;
        
        // Check if meets access criteria
        \$hasAccess = in_array(\$enrollment->status, ['active', 'completed']) && 
                     \$enrollment->approval_status === 'approved';
        echo '  Meets access criteria: ' . (\$hasAccess ? 'YES' : 'NO') . PHP_EOL;
    } else {
        echo 'NO ENROLLMENT found for this program!' . PHP_EOL;
    }
}
"

# Test 4: Check lesson unlock status
echo "📋 Test 4: Checking lesson unlock status..."
php artisan tinker --execute="
\$user = App\Models\User::where('email', '$STUDENT_IDENTIFIER')
    ->orWhere('id', '$STUDENT_IDENTIFIER')->first();
\$resource = App\Models\LessonResource::find($RESOURCE_ID);

if (\$user && \$resource) {
    \$lesson = \$resource->lesson;
    echo 'Lesson level: ' . \$lesson->level . PHP_EOL;
    
    if (\$lesson->level === 1) {
        echo 'Level 1 lesson - always unlocked: YES' . PHP_EOL;
    } else {
        \$previousLevel = \$lesson->level - 1;
        echo 'Checking if level ' . \$previousLevel . ' is completed...' . PHP_EOL;
        
        \$previousLevelLessons = \$lesson->program->lessons()
            ->where('level', \$previousLevel)
            ->where('is_active', true)
            ->pluck('id');
            
        echo 'Previous level lessons count: ' . \$previousLevelLessons->count() . PHP_EOL;
        
        if (\$previousLevelLessons->isEmpty()) {
            echo 'No previous level lessons - unlocked: YES' . PHP_EOL;
        } else {
            \$completedCount = App\Models\LessonProgress::where('user_id', \$user->id)
                ->whereIn('lesson_id', \$previousLevelLessons)
                ->where('status', 'completed')
                ->count();
                
            echo 'Completed previous level lessons: ' . \$completedCount . PHP_EOL;
            echo 'Lesson unlocked: ' . (\$completedCount === \$previousLevelLessons->count() ? 'YES' : 'NO') . PHP_EOL;
        }
    }
}
"

# Test 5: Test ResourceService access method
echo "📋 Test 5: Testing ResourceService access method..."
php artisan tinker --execute="
\$user = App\Models\User::where('email', '$STUDENT_IDENTIFIER')
    ->orWhere('id', '$STUDENT_IDENTIFIER')->first();
\$resource = App\Models\LessonResource::find($RESOURCE_ID);

if (\$user && \$resource) {
    \$resourceService = app(App\Services\ResourceService::class);
    \$hasAccess = \$resourceService->canUserAccessResource(\$resource, \$user);
    echo 'ResourceService access result: ' . (\$hasAccess ? 'ALLOWED' : 'DENIED') . PHP_EOL;
}
"

echo ""
echo "🔍 Debug completed. Review the output above to identify the access issue."
echo ""
echo "Common fixes:"
echo "1. If enrollment not found: Student needs to enroll in the program"
echo "2. If enrollment not approved: Admin needs to approve the enrollment"  
echo "3. If enrollment status is 'pending': Change to 'active'"
echo "4. If lesson locked: Student needs to complete previous level lessons"