#!/bin/bash

# Setup Branch Protection Rules for Kids Education Website
# This script configures branch protection rules using GitHub CLI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed. Please install it first:"
    echo "https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    print_error "Not authenticated with GitHub CLI. Please run 'gh auth login' first."
    exit 1
fi

# Get repository information
REPO_OWNER=$(gh repo view --json owner --jq '.owner.login')
REPO_NAME=$(gh repo view --json name --jq '.name')

print_status "Setting up branch protection for repository: $REPO_OWNER/$REPO_NAME"

# Function to setup branch protection for a specific branch
setup_branch_protection() {
    local branch=$1
    
    print_status "Configuring branch protection for '$branch' branch..."
    
    # Create branch protection rule
    gh api repos/$REPO_OWNER/$REPO_NAME/branches/$branch/protection \
        --method PUT \
        --field required_status_checks='{
            "strict": true,
            "contexts": [
                "Unit Tests",
                "Frontend Tests",
                "PR Checks Complete"
            ]
        }' \
        --field enforce_admins=true \
        --field required_pull_request_reviews='{
            "required_approving_review_count": 1,
            "dismiss_stale_reviews": true,
            "require_code_owner_reviews": false,
            "require_last_push_approval": false
        }' \
        --field restrictions=null \
        --field allow_force_pushes=false \
        --field allow_deletions=false \
        --field block_creations=false \
        --field required_conversation_resolution=true \
        --field lock_branch=false \
        --field allow_fork_syncing=true
    
    if [ $? -eq 0 ]; then
        print_success "Branch protection configured for '$branch'"
    else
        print_error "Failed to configure branch protection for '$branch'"
        return 1
    fi
}

# Setup protection for main branch
print_status "Setting up protection for main branch..."
setup_branch_protection "main"

# Setup protection for develop branch (if it exists)
if gh api repos/$REPO_OWNER/$REPO_NAME/branches/develop &> /dev/null; then
    print_status "Setting up protection for develop branch..."
    setup_branch_protection "develop"
else
    print_warning "Develop branch not found. Skipping protection setup for develop branch."
fi

# Create additional security settings
print_status "Configuring additional repository security settings..."

# Enable vulnerability alerts
gh api repos/$REPO_OWNER/$REPO_NAME/vulnerability-alerts \
    --method PUT \
    --silent || print_warning "Could not enable vulnerability alerts"

# Enable automated security fixes
gh api repos/$REPO_OWNER/$REPO_NAME/automated-security-fixes \
    --method PUT \
    --silent || print_warning "Could not enable automated security fixes"

# Show final status
print_success "Branch protection setup complete!"
print_status "Summary of protections applied:"
echo "  ✅ Required status checks before merging"
echo "  ✅ Require branches to be up to date before merging"
echo "  ✅ Require pull request reviews (1 approver)"
echo "  ✅ Dismiss stale reviews when new commits are pushed"
echo "  ✅ Require conversation resolution before merging"
echo "  ✅ Enforce restrictions for administrators"
echo "  ✅ Prevent force pushes"
echo "  ✅ Prevent branch deletion"

print_status "Required status checks configured:"
echo "  - Unit Tests"
echo "  - Frontend Tests"
echo "  - PR Checks Complete"

print_warning "Note: You may need to adjust these settings based on your team's workflow."
print_status "You can modify these settings at: https://github.com/$REPO_OWNER/$REPO_NAME/settings/branches"