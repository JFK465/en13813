#!/bin/bash

# Script to remove sensitive files from Git history
# WARNING: This will rewrite history! Make sure to coordinate with your team

echo "⚠️  WARNING: This script will rewrite Git history!"
echo "Make sure all team members have pushed their changes and are aware of this operation."
echo ""
read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Operation cancelled."
    exit 0
fi

echo ""
echo "📋 Creating backup branch..."
git branch backup-before-secret-removal-$(date +%Y%m%d-%H%M%S)

echo ""
echo "🔍 Files to be removed from history:"
echo "  - apps/web/.env.production"
echo "  - vercel-env-import.txt"
echo "  - SETUP_AND_TESTING_GUIDE.md (will be cleaned of secrets)"
echo "  - Any .env files that might have been committed"

echo ""
echo "🗑️  Removing sensitive files from Git history..."

# Using git filter-branch (alternative: BFG Repo-Cleaner for larger repos)
git filter-branch --force --index-filter \
    'git rm --cached --ignore-unmatch apps/web/.env.production vercel-env-import.txt .env.production .env' \
    --prune-empty --tag-name-filter cat -- --all

# Clean secrets from SETUP_AND_TESTING_GUIDE.md throughout history
echo ""
echo "🔒 Cleaning secrets from SETUP_AND_TESTING_GUIDE.md..."
git filter-branch --force --tree-filter "
    if [ -f SETUP_AND_TESTING_GUIDE.md ]; then
        sed -i.bak 's/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9[^[:space:]]*/<REDACTED-JWT-TOKEN>/g' SETUP_AND_TESTING_GUIDE.md
        rm -f SETUP_AND_TESTING_GUIDE.md.bak
    fi
" --prune-empty --tag-name-filter cat -- --all

echo ""
echo "🧹 Cleaning up..."

# Clean up the .git directory
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "✅ Local repository cleaned!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Force push to remote: git push --force --all"
echo "2. Force push tags: git push --force --tags"
echo "3. All team members must delete their local repos and clone fresh"
echo "4. Rotate ALL compromised secrets immediately!"
echo ""
echo "📝 Compromised secrets that need rotation:"
echo "  - Supabase JWT tokens"
echo "  - Supabase API keys"
echo "  - Any other API keys in the removed files"