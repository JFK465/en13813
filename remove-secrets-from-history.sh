#!/bin/bash

# Script to remove sensitive files from git history
# WARNING: This will rewrite git history!

echo "==================================="
echo "Git History Cleanup for Secrets"
echo "==================================="
echo ""
echo "This script will remove sensitive files from git history."
echo "WARNING: This will rewrite git history and require force push!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Operation cancelled."
    exit 0
fi

echo ""
echo "Creating backup branch..."
git branch backup-before-cleanup-$(date +%Y%m%d-%H%M%S)

echo ""
echo "Removing sensitive files from history..."

# Remove .env.production files
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch apps/web/.env.production' \
  --prune-empty --tag-name-filter cat -- --all

# Remove vercel-env-import.txt
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch vercel-env-import.txt' \
  --prune-empty --tag-name-filter cat -- --all

echo ""
echo "Cleaning up refs..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "==================================="
echo "Cleanup completed!"
echo "==================================="
echo ""
echo "IMPORTANT NEXT STEPS:"
echo ""
echo "1. ROTATE ALL SECRETS:"
echo "   - Generate new Supabase service role key"
echo "   - Generate new Supabase anon key"
echo "   - Generate new Resend API key"
echo "   - Update all keys in Vercel environment variables"
echo ""
echo "2. FORCE PUSH TO REMOTE:"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "3. NOTIFY TEAM MEMBERS:"
echo "   All team members need to:"
echo "   - Delete their local repository"
echo "   - Clone fresh from remote"
echo "   OR"
echo "   - git fetch origin"
echo "   - git reset --hard origin/main"
echo ""
echo "4. UPDATE CI/CD:"
echo "   Ensure all CI/CD pipelines have the new secrets"
echo ""