# Server Restoration Instructions

## Problem
The local development database is empty (0 bytes), which explains why the student cannot access their dashboard. The database needs to be properly initialized with tables, programs, and the student's enrollment.

## Solution Steps for Your Server

### 1. Check Database Status
On your server, first check if the database has tables:
```bash
php artisan migrate:status
```

### 2. Run Migrations (if needed)
If tables are missing, run:
```bash
php artisan migrate --force
```

### 3. Seed the Database
Create the Mental Arithmetic program and other basic data:
```bash
php artisan db:seed --class=ProgramSeeder
```

### 4. Restore Student Enrollment
Use the custom command I created to restore the enrollment for user ID 2:
```bash
php artisan enrollment:restore 2
```

### 5. Alternative Manual Database Approach
If the artisan commands don't work due to PHP version issues, you can manually run these SQL commands in your database:

```sql
-- Create the Mental Arithmetic program
INSERT INTO programs (name, description, slug, price, duration, duration_weeks, icon, color, light_color, text_color, requires_monthly_payment, created_at, updated_at) 
VALUES (
    'Mental Arithmetic Mastery',
    'Develop exceptional calculation speed and accuracy using abacus techniques. Enhances concentration, memory, and analytical thinking skills for children aged 6-12.',
    'mental-arithmetic-mastery',
    55,
    '12 months',
    48,
    'Calculator',
    'bg-blue-600',
    'bg-blue-100',
    'text-blue-900',
    1,
    datetime('now'),
    datetime('now')
);

-- Create the enrollment for user ID 2 (replace with actual program ID from above)
INSERT INTO enrollments (user_id, program_id, enrolled_at, status, approval_status, progress, approved_at, approved_by, access_blocked, created_at, updated_at)
VALUES (2, 1, datetime('now'), 'active', 'approved', 0, datetime('now'), 1, 0, datetime('now'), datetime('now'));
```

### 6. Verify the Fix
After running the above steps, the student should be able to:
- Access their dashboard without 500 errors
- See their Mental Arithmetic Mastery program
- Access lessons and track progress

## What the Code Fixes Do

The code changes I made will:
1. Handle null program relationships gracefully (no more crashes)
2. Show helpful messages when programs are temporarily unavailable  
3. Filter out enrollments with missing programs from lists
4. Provide safe fallbacks for dashboard rendering

## Files Modified
- `app/Services/EnrollmentService.php` - Added null safety checks
- `app/Http/Controllers/ProgramController.php` - Fixed null property access
- `app/Http/Controllers/DashboardController.php` - Added robust enrollment handling
- `app/Console/Commands/RestoreEnrollment.php` - Created restoration command

The student should now have a working dashboard once the database is properly set up on your server.