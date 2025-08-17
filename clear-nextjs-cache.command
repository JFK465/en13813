#!/bin/bash

# Change to the script directory
cd "$(dirname "$0")"

echo "🧹 Clearing Next.js cache and rebuilding..."

# Navigate to the web app directory
cd apps/web

echo "📁 Current directory: $(pwd)"

# Stop any running Next.js processes
echo "🛑 Stopping any running Next.js processes..."
pkill -f "next dev" || true
pkill -f "next-server" || true

# Clear Next.js cache
echo "🗑️  Clearing .next cache..."
rm -rf .next

# Clear Node modules cache (optional - uncomment if needed)
# echo "🗑️  Clearing node_modules..."
# rm -rf node_modules

# Clear pnpm cache
echo "🗑️  Clearing pnpm cache..."
pnpm store prune

# Reinstall dependencies (optional - uncomment if needed)
# echo "📦 Reinstalling dependencies..."
# pnpm install

# Clear browser cache (Chrome)
echo "🌐 Clearing Chrome cache for localhost..."
osascript -e 'tell application "Google Chrome"
    set targetURL to "http://localhost:3001"
    repeat with w in windows
        repeat with t in tabs of w
            if URL of t contains "localhost:3001" then
                reload t
            end if
        end repeat
    end repeat
end tell' 2>/dev/null || echo "Chrome not running or script failed"

echo "✅ Cache cleared! You can now restart Next.js with:"
echo "   cd apps/web && pnpm dev"
echo ""
echo "🚀 Starting Next.js development server..."
pnpm dev -p 3001

echo "Press any key to exit..."
read -n 1