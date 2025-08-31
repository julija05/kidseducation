#!/bin/bash

# Fix Student Enrollment Issues
# Run this to fix common enrollment problems

echo "🔧 Fixing student enrollment issues..."

echo "Choose a fix option:"
echo "1. Approve all pending enrollments"
echo "2. Activate all approved enrollments" 
echo "3. Fix specific student enrollment (interactive)"
echo "4. Show enrollment statistics"
read -r OPTION

case $OPTION in
1)
    echo "🔄 Approving all pending enrollments..."
    php artisan tinker --execute="
    \$pendingEnrollments = App\Models\Enrollment::where('approval_status', 'pending')->get();
    echo 'Found ' . \$pendingEnrollments->count() . ' pending enrollments' . PHP_EOL;
    
    foreach (\$pendingEnrollments as \$enrollment) {
        \$enrollment->update(['approval_status' => 'approved']);
        echo 'Approved enrollment for user: ' . \$enrollment->user->email . ' in program: ' . \$enrollment->program->name . PHP_EOL;
    }
    echo 'Done!' . PHP_EOL;
    "
    ;;

2)
    echo "🔄 Activating all approved enrollments..."
    php artisan tinker --execute="
    \$approvedEnrollments = App\Models\Enrollment::where('approval_status', 'approved')
        ->where('status', '!=', 'active')->get();
    echo 'Found ' . \$approvedEnrollments->count() . ' approved but inactive enrollments' . PHP_EOL;
    
    foreach (\$approvedEnrollments as \$enrollment) {
        \$enrollment->update(['status' => 'active']);
        echo 'Activated enrollment for user: ' . \$enrollment->user->email . ' in program: ' . \$enrollment->program->name . PHP_EOL;
    }
    echo 'Done!' . PHP_EOL;
    "
    ;;

3)
    echo "Enter student email:"
    read -r STUDENT_EMAIL
    echo "Enter program slug (e.g., mental-arithmetic-mastery):"
    read -r PROGRAM_SLUG
    
    echo "🔄 Fixing enrollment for $STUDENT_EMAIL in $PROGRAM_SLUG..."
    php artisan tinker --execute="
    \$user = App\Models\User::where('email', '$STUDENT_EMAIL')->first();
    \$program = App\Models\Program::where('slug', '$PROGRAM_SLUG')->first();
    
    if (!\$user) {
        echo 'User not found: $STUDENT_EMAIL' . PHP_EOL;
        exit(1);
    }
    
    if (!\$program) {
        echo 'Program not found: $PROGRAM_SLUG' . PHP_EOL;
        exit(1);
    }
    
    \$enrollment = \$user->enrollments()->where('program_id', \$program->id)->first();
    
    if (\$enrollment) {
        echo 'Current enrollment status: ' . \$enrollment->status . PHP_EOL;
        echo 'Current approval status: ' . \$enrollment->approval_status . PHP_EOL;
        
        \$enrollment->update([
            'status' => 'active',
            'approval_status' => 'approved'
        ]);
        
        echo 'Fixed! New status: active, approved' . PHP_EOL;
    } else {
        echo 'Creating new enrollment...' . PHP_EOL;
        App\Models\Enrollment::create([
            'user_id' => \$user->id,
            'program_id' => \$program->id,
            'status' => 'active',
            'approval_status' => 'approved'
        ]);
        echo 'Created new active, approved enrollment' . PHP_EOL;
    }
    "
    ;;

4)
    echo "📊 Enrollment statistics..."
    php artisan tinker --execute="
    echo 'Total enrollments: ' . App\Models\Enrollment::count() . PHP_EOL;
    echo 'Pending approval: ' . App\Models\Enrollment::where('approval_status', 'pending')->count() . PHP_EOL;
    echo 'Approved: ' . App\Models\Enrollment::where('approval_status', 'approved')->count() . PHP_EOL;
    echo 'Active: ' . App\Models\Enrollment::where('status', 'active')->count() . PHP_EOL;
    echo 'Completed: ' . App\Models\Enrollment::where('status', 'completed')->count() . PHP_EOL;
    
    echo PHP_EOL . 'Recent enrollments:' . PHP_EOL;
    \$recent = App\Models\Enrollment::with(['user', 'program'])
        ->latest()
        ->take(5)
        ->get();
        
    foreach (\$recent as \$enrollment) {
        echo '- ' . \$enrollment->user->email . ' in ' . \$enrollment->program->name . ' (' . \$enrollment->status . '/' . \$enrollment->approval_status . ')' . PHP_EOL;
    }
    "
    ;;

*)
    echo "Invalid option selected"
    ;;
esac

echo "✅ Enrollment fix completed!"