# CLAUDE.md - Kids Education Website

## Project Overview

This is a **Kids Education Website** called **"Abacoding"** - a Laravel-based educational platform designed for children to learn various subjects including mathematics, coding, and other educational programs. The application features a comprehensive learning management system with interactive lessons, progress tracking, and resource management.

## Technology Stack

### Backend
- **Laravel 11.31** - PHP web application framework
- **PHP 8.2+** - Server-side language
- **SQLite** - Default database (configurable to MySQL/PostgreSQL)
- **Spatie Laravel Permission** - Role and permission management
- **Laravel Sanctum** - API authentication
- **Laravel Breeze** - Authentication scaffolding

### Frontend
- **React 18.2** - UI library
- **Inertia.js** - Modern monolith approach (React + Laravel)
- **Tailwind CSS 3.2** - Utility-first CSS framework
- **Vite 6.0** - Build tool and dev server
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Development Tools
- **Composer** - PHP dependency management
- **NPM** - Node.js package management
- **PHPUnit** - PHP testing framework
- **Laravel Pint** - Code style fixer
- **Docker Compose** - Containerization support

## Project Structure

### Key Directories

```
├── app/
│   ├── Http/Controllers/           # Application controllers
│   │   ├── Admin/                 # Admin-specific controllers
│   │   ├── Auth/                  # Authentication controllers
│   │   ├── Front/                 # Public-facing controllers
│   │   └── Student/               # Student-specific controllers
│   ├── Models/                    # Eloquent models
│   ├── Policies/                  # Authorization policies
│   ├── Repositories/              # Repository pattern implementation
│   ├── Services/                  # Business logic services
│   └── Mail/                      # Email classes
├── resources/
│   ├── js/                        # React frontend code
│   │   ├── Components/            # Reusable React components
│   │   ├── Pages/                 # Inertia.js pages
│   │   ├── Layouts/               # Layout components
│   │   └── Utils/                 # Helper utilities
│   ├── css/                       # Stylesheets
│   └── assets/                    # Static assets (images, etc.)
├── database/
│   ├── migrations/                # Database schema migrations
│   ├── seeders/                   # Database seeders
│   └── factories/                 # Model factories for testing
└── routes/
    ├── web.php                    # Web routes
    └── auth.php                   # Authentication routes
```

### Core Models
- **User** - Students and administrators with role-based access
- **Program** - Educational programs (Math, Coding, etc.)
- **Lesson** - Individual lessons within programs
- **LessonResource** - Learning materials (videos, documents, etc.)
- **Enrollment** - Student enrollments in programs
- **LessonProgress** - Progress tracking for lessons
- **News** - Platform announcements and updates

## Key Features

### User Roles
- **Students** - Can enroll in programs, view lessons, track progress
- **Admins** - Full platform management capabilities

### Student Features
- Browse and enroll in educational programs
- Access interactive lessons with various resource types
- Track learning progress
- Download and stream lesson resources
- View program-specific dashboards

### Admin Features
- Manage educational programs and lessons
- Handle enrollment approvals/rejections
- Upload and organize lesson resources
- Manage news and announcements
- Monitor student progress

### Resource Types
- YouTube videos
- PDF documents
- Word documents
- Other downloadable materials

## Development Commands

### Backend (Laravel)
```bash
# Install PHP dependencies
composer install

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Seed database with sample data
php artisan db:seed

# Start development server
php artisan serve

# Run tests
php artisan test

# Run queue worker
php artisan queue:work

# View logs
php artisan pail
```

### Frontend (React/Vite)
```bash
# Install Node.js dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Combined Development
```bash
# Start all services (server, queue, logs, vite)
composer dev
```

## Architecture Patterns

### Backend Patterns
- **MVC Architecture** - Model-View-Controller pattern
- **Repository Pattern** - Data access abstraction layer
- **Service Layer** - Business logic separation
- **Policy-based Authorization** - Laravel policies for access control
- **Form Request Validation** - Dedicated request classes for validation

### Frontend Patterns
- **Component-based Architecture** - Reusable React components
- **Layout System** - Shared layouts for different user types
- **Utility-first CSS** - Tailwind CSS for styling
- **Custom Hooks** - React hooks for shared logic

### Key Architectural Decisions
- **Inertia.js** - Bridges Laravel backend with React frontend
- **SQLite for Development** - Simplified development setup
- **File-based Storage** - Local storage for lesson resources
- **Role-based Access Control** - Spatie Permission package

## Database Schema

### Key Relationships
- Users have many Enrollments
- Programs have many Lessons
- Lessons have many LessonResources
- Users track LessonProgress for each Lesson
- Enrollments link Users to Programs with approval status

## File Storage

### Public Storage
- `/storage/app/public/program_images/` - Program cover images
- `/storage/app/public/news/` - News article images

### Private Storage
- `/storage/app/private/lesson-resources/` - Protected lesson materials

## Environment Configuration

### Required Environment Variables
```bash
APP_NAME=Abacoding
APP_ENV=local
APP_DEBUG=true
DB_CONNECTION=sqlite
MAIL_MAILER=log
QUEUE_CONNECTION=database
```

## Git Workflow

### Current Branch Structure
- **Main Branch** - Production-ready code
- **Feature Branches** - Named with ticket IDs (e.g., KE-44)

### Recent Development Focus
- Lesson preview functionality
- Resource management improvements
- Student dashboard enhancements
- Code refactoring and organization

## Testing

- **PHPUnit** - Backend testing with Feature and Unit tests
- **Test Database** - SQLite in-memory database for testing
- **Model Factories** - Generate test data

## Security Considerations

- **CSRF Protection** - Laravel's built-in CSRF protection
- **Authentication** - Laravel Breeze with session-based auth
- **Authorization** - Role and permission-based access control
- **File Upload Security** - Validated file types and private storage
- **SQL Injection Prevention** - Eloquent ORM protection

## Performance Features

- **Vite HMR** - Hot module replacement for fast development
- **Database Optimization** - Proper indexing and relationships
- **Asset Optimization** - Vite-based asset bundling
- **Caching** - Laravel's caching system

## Deployment Considerations

- **Docker Support** - Docker Compose configuration available
- **Queue Management** - Database-based queue system
- **Log Management** - Laravel Pail for log monitoring
- **Asset Building** - Vite production builds

## Future Claude Development Guidelines

### Code Style
- Follow Laravel conventions and PSR standards
- Use TypeScript-style prop validation in React components
- Maintain consistent naming patterns (PascalCase for components, camelCase for variables)
- Keep components focused and single-purpose

### Database Operations
- Always use Eloquent ORM and avoid raw SQL
- Use migrations for schema changes
- Implement proper foreign key constraints
- Use model factories for test data

### Security Best Practices
- Validate all inputs using Form Request classes
- Use Laravel policies for authorization
- Sanitize file uploads and store privately when sensitive
- Never expose internal IDs in URLs (use slugs or UUIDs)

### Performance Guidelines
- Use eager loading to avoid N+1 queries
- Implement proper database indexing
- Use caching for frequently accessed data
- Optimize images and assets

### React Development
- Use functional components with hooks
- Implement proper error boundaries
- Follow accessibility guidelines
- Use Tailwind utilities consistently

## MySQL Key Length Issues & Migration Fixes

### Problem
MySQL with utf8mb4 collation has a key length limit of 1000 bytes. String columns default to 255 characters which can exceed this limit in composite indexes.

### Fixed Migrations
All migrations have been updated with:
1. **`Schema::hasTable()` checks** to prevent "table already exists" errors
2. **Reduced string column lengths** for indexed columns

### Key Length Fixes Applied:
- **Permissions** (`2025_05_04_091757_create_permission_tables.php`):
  - `model_type` → 191 chars (was 255)
  - `name` → 225 chars (was 255) 
  - `guard_name` → 25 chars (was 255)
  
- **Notifications** (`2025_07_22_000000_create_notifications_table.php`):
  - `type` → 50 chars (was 255)
  - `related_model_type` → 191 chars (was 255)
  
- **Reviews** (`2025_08_07_120000_create_reviews_table.php`):
  - Replaced `morphs('reviewable')` with manual columns
  - `reviewable_type` → 191 chars (was 255)

### Migration Pattern
All table creation migrations now use this pattern:
```php
if (!Schema::hasTable('table_name')) {
    Schema::create('table_name', function (Blueprint $table) {
        // table definition
    });
}
```

### String Column Guidelines
- Use 191 chars max for morphable type columns (polymorphic relationships)
- Use 50 chars max for enum-like string columns (status, type, etc.)
- Use 225 chars max for name columns when indexed
- Use 25 chars max for guard_name type columns

This prevents MySQL key length errors and ensures migrations work on production servers.

### Creating New Migrations

When making changes to existing table structures, ALWAYS create new migration files instead of modifying existing ones. This ensures database consistency across different environments.

#### Commands for Common Migration Types:

```bash
# Add new columns to existing table
php artisan make:migration add_column_name_to_table_name_table --table=table_name

# Remove columns from existing table
php artisan make:migration remove_column_name_from_table_name_table --table=table_name

# Create new table
php artisan make:migration create_table_name_table

# Add index to existing table
php artisan make:migration add_index_to_table_name_table --table=table_name

# Add foreign key constraint
php artisan make:migration add_foreign_key_to_table_name_table --table=table_name
```

#### Migration Best Practices:

1. **Always use descriptive names** that explain what the migration does
2. **Never modify existing migrations** that have been run on production
3. **Use `Schema::hasTable()` and `Schema::hasColumn()` checks** to prevent errors
4. **Follow the string length guidelines** for indexed columns
5. **Include proper `down()` method** for rollback capability

#### Example Migration Template:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('table_name', function (Blueprint $table) {
            if (!Schema::hasColumn('table_name', 'new_column')) {
                $table->string('new_column', 191)->nullable()->after('existing_column');
                $table->index('new_column'); // If needed for queries
            }
        });
    }

    public function down(): void
    {
        Schema::table('table_name', function (Blueprint $table) {
            if (Schema::hasColumn('table_name', 'new_column')) {
                $table->dropIndex(['new_column']); // Drop index first if exists
                $table->dropColumn('new_column');
            }
        });
    }
};
```

#### Column Existence Checks:
Always check if columns exist before adding/dropping them:
```php
// Adding columns
if (!Schema::hasColumn('table_name', 'column_name')) {
    $table->string('column_name');
}

// Dropping columns  
if (Schema::hasColumn('table_name', 'column_name')) {
    $table->dropColumn('column_name');
}

// Adding indexes
if (!Schema::hasIndex('table_name', 'index_name')) {
    $table->index('column_name', 'index_name');
}
```

This prevents MySQL key length errors and ensures migrations work on production servers.

This documentation should help future Claude instances understand the codebase structure, make informed decisions, and maintain consistency with the existing architecture and patterns.