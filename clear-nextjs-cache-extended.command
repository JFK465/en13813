#!/bin/bash

# Clear Next.js Cache Script for macOS
# Double-click this file to run it

cd "$(dirname "$0")"

echo "🧹 Clearing Next.js cache and rebuilding..."

# Stop any running processes
echo "Stopping running processes..."
pkill -f "next"
pkill -f "node.*3001"

# Clear Next.js cache
echo "Clearing .next directory..."
rm -rf apps/web/.next

# Clear Turbo cache
echo "Clearing .turbo directories..."
rm -rf .turbo
rm -rf apps/web/.turbo

# Clear node_modules and reinstall
echo "Clearing node_modules..."
rm -rf node_modules
rm -rf apps/web/node_modules

# Clear package manager cache
echo "Clearing pnpm cache..."
pnpm store prune

# Reinstall dependencies
echo "Reinstalling dependencies..."
pnpm install

# Start the development server
echo "Starting development server..."
cd apps/web
pnpm dev

echo "✅ Cache cleared and server started!"