# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Kids Education Website (Abacoding) project.

## Overview

The CI/CD pipeline consists of multiple GitHub Actions workflows that handle testing, building, security scanning, and deployment of the Laravel/React application.

## Workflows

### 1. Main CI/CD Pipeline (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` branch

**Jobs:**

#### Test Job
- Sets up PHP 8.2 and Node.js 18
- Installs dependencies (Composer & NPM)
- Runs database migrations with MySQL 8.0
- Executes PHPUnit tests with coverage
- Runs static analysis (PHPStan)
- Performs code style checks (PHP CS Fixer)

#### Build Job
- Builds production-ready frontend assets
- Optimizes Laravel for production (caching configs, routes, views)
- Creates build artifacts for deployment

#### Security Scan Job
- Runs Composer security audit
- Performs npm security audit
- Checks for vulnerabilities in dependencies

#### Code Quality Job
- Runs ESLint for JavaScript/React code
- Checks code formatting with Prettier
- Scans for large files that shouldn't be committed

### 2. Deployment Pipeline (`deploy.yml`)

**Triggers:**
- Push to `main` branch
- Tags matching `v*` pattern
- Manual workflow dispatch with environment selection

**Features:**
- Environment-specific deployments (staging/production)
- Database backup before deployment
- Automatic rollback on failure
- Secure environment variable handling
- Deployment artifact creation

### 3. Security Pipeline (`security.yml`)

**Triggers:**
- Weekly scheduled runs (Mondays at 2 AM)
- Push to `main` branch
- Pull requests to `main` branch

**Security Checks:**
- CodeQL analysis for JavaScript and PHP
- Semgrep security scanning
- OWASP Dependency Check
- Hardcoded secrets detection
- File permission verification
- Debug information exposure checks

## Configuration Files

### Code Quality Tools

#### ESLint (`.eslintrc.js`)
- Configured for React and modern JavaScript
- Enforces consistent code style
- Warns about potential issues
- Integrates with React Hooks linting

#### Prettier (`.prettierrc`)
- Consistent code formatting
- 4-space indentation
- Double quotes preference
- 80-character line width

#### PHPStan (`phpstan.neon`)
- Level 6 static analysis
- Laravel-specific rules
- Excludes vendor and node_modules
- Custom error ignoring for Eloquent

## Docker Configuration

### Multi-stage Dockerfile
1. **Node.js stage**: Builds frontend assets
2. **PHP stage**: Sets up production environment

### Components:
- **Nginx**: Web server with optimized configuration
- **PHP-FPM**: PHP process manager
- **Supervisor**: Process monitoring and management
- **Laravel Queue Worker**: Background job processing

## Required Secrets

Configure these secrets in your GitHub repository settings:

### Application Secrets
- `APP_KEY`: Laravel application key
- `APP_URL`: Application URL

### Database Secrets
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_DATABASE`: Database name
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password

### Redis Secrets (if using Redis)
- `REDIS_HOST`: Redis host
- `REDIS_PASSWORD`: Redis password
- `REDIS_PORT`: Redis port

### Mail Configuration
- `MAIL_MAILER`: Mail service (smtp, sendmail, etc.)
- `MAIL_HOST`: SMTP host
- `MAIL_PORT`: SMTP port
- `MAIL_USERNAME`: SMTP username
- `MAIL_PASSWORD`: SMTP password
- `MAIL_ENCRYPTION`: Encryption method (tls, ssl)
- `MAIL_FROM_ADDRESS`: From email address

### Deployment Secrets (optional)
- `HOST`: Server hostname for SSH deployment
- `USERNAME`: SSH username
- `SSH_KEY`: SSH private key
- `PORT`: SSH port
- `AWS_ACCESS_KEY_ID`: AWS access key (if using AWS)
- `AWS_SECRET_ACCESS_KEY`: AWS secret key (if using AWS)
- `S3_BUCKET`: S3 bucket name (if using S3)
- `BACKUP_BUCKET`: S3 bucket for backups (if using S3)

### Security Scanning (optional)
- `SEMGREP_APP_TOKEN`: Semgrep authentication token

## Environment Setup

### Development Environment
1. Copy `.env.example` to `.env`
2. Configure database connection
3. Run `php artisan key:generate`
4. Run `php artisan migrate`
5. Run `npm install && npm run dev`

### Testing Environment
The CI pipeline automatically creates a testing environment with:
- MySQL database
- Array cache driver
- Sync queue connection
- Array session driver
- Array mail driver

### Production Environment
The deployment pipeline creates a production environment with:
- MySQL database
- Redis for caching, sessions, and queues
- Configured mail service
- Optimized Laravel caches

## Deployment Strategies

### Staging Deployment
- Triggered manually via workflow dispatch
- Uses staging environment secrets
- Full testing environment
- Can be used for UAT

### Production Deployment
- Triggered by pushes to main branch or version tags
- Uses production environment secrets
- Includes database backup
- Has rollback capability

### Zero-Downtime Deployment
For zero-downtime deployments, consider:
1. Blue-green deployment strategy
2. Load balancer configuration
3. Database migration strategies
4. Asset versioning

## Monitoring and Alerts

### Deployment Notifications
- Success/failure notifications included in workflows
- Can be extended with Slack, Teams, or email notifications

### Security Monitoring
- Weekly automated security scans
- Vulnerability alerts for dependencies
- Code quality reports

### Performance Monitoring
Consider adding:
- Application performance monitoring (APM)
- Database performance monitoring
- Frontend performance tracking
- Error tracking (Sentry, Bugsnag)

## Best Practices

### Security
1. Never commit secrets to the repository
2. Use environment-specific secrets
3. Regularly update dependencies
4. Monitor security scan results
5. Implement proper access controls

### Performance
1. Optimize Docker images
2. Use caching strategies
3. Minimize build times
4. Monitor resource usage
5. Implement proper logging

### Reliability
1. Test all changes thoroughly
2. Use feature flags for risky deployments
3. Maintain database backups
4. Have rollback procedures ready
5. Monitor application health

## Troubleshooting

### Common Issues

#### Failed Tests
1. Check database connectivity
2. Verify environment variables
3. Review migration failures
4. Check dependency conflicts

#### Build Failures
1. Check Node.js/NPM versions
2. Verify asset compilation
3. Review package.json dependencies
4. Check disk space and memory

#### Deployment Issues
1. Verify server connectivity
2. Check environment secrets
3. Review deployment logs
4. Verify file permissions

#### Security Scan Failures
1. Review vulnerability reports
2. Update affected dependencies
3. Check for false positives
4. Implement security patches

### Getting Help
1. Check GitHub Actions logs
2. Review Laravel logs
3. Check server logs
4. Contact the development team

## Future Improvements

### Potential Enhancements
1. Add automated performance testing
2. Implement infrastructure as code (Terraform)
3. Add more comprehensive security scans
4. Implement automatic dependency updates
5. Add visual regression testing
6. Implement feature flag management
7. Add comprehensive monitoring dashboards

### Scaling Considerations
1. Container orchestration (Kubernetes)
2. Multi-region deployment
3. Auto-scaling configuration
4. Database clustering
5. CDN integration
6. Advanced caching strategies