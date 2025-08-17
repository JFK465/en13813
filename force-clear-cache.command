#!/bin/bash

# Force clear Next.js cache script
cd "$(dirname "$0")"

echo "🛑 Stopping all Node processes..."
pkill -9 -f "node"
pkill -9 -f "next"

echo "💣 Force removing cache directories..."
cd apps/web

# Use find to delete .next directory contents
find .next -type f -delete 2>/dev/null || true
find .next -type d -delete 2>/dev/null || true
rm -rf .next 2>/dev/null || true

# Clear turbo cache
find .turbo -type f -delete 2>/dev/null || true
find .turbo -type d -delete 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true

# Clear parent turbo cache
cd ../..
find .turbo -type f -delete 2>/dev/null || true
find .turbo -type d -delete 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true

echo "✅ Cache cleared! Now restart your dev server manually."
echo "Run: cd apps/web && pnpm dev"