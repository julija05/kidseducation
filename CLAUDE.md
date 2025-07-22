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

This documentation should help future Claude instances understand the codebase structure, make informed decisions, and maintain consistency with the existing architecture and patterns.