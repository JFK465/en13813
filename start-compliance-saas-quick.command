#!/bin/bash

# EN13813 Compliance SaaS - Quick Start Script (No Database Reset)
# This script starts the application without resetting the database

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

clear
echo "🚀 EN13813 Compliance SaaS - Quick Start (No DB Reset)"
echo "======================================================"
echo ""

# Function to kill process on port
kill_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}Port $port is already in use. Killing process...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null
        sleep 1
    fi
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running. Starting Docker Desktop...${NC}"
    open -a Docker
    echo "Waiting for Docker to start..."
    while ! docker info >/dev/null 2>&1; do
        sleep 2
        printf "."
    done
    echo ""
fi

# Check if Supabase is already running
echo "🗄️  Checking Supabase status..."
if pnpm supabase status 2>/dev/null | grep -q "RUNNING"; then
    echo -e "${GREEN}✅ Supabase is already running${NC}"
else
    echo "Starting Supabase (without database reset)..."
    pnpm supabase start --ignore-health-check
fi

# Kill any process on port 3001
kill_port 3001

# Start the dev server
echo ""
echo "🌐 Starting Next.js development server on port 3001..."
echo ""

# Start in background
nohup pnpm dev > dev.log 2>&1 &
DEV_PID=$!

echo -e "${GREEN}✅ Next.js server started (PID: $DEV_PID)${NC}"

# Wait a bit for server to start
echo "Waiting for server to be ready..."
sleep 5

# Open browser
echo "📱 Opening browser..."
open http://localhost:3001

# Show info
echo ""
echo "🎉 EN13813 Compliance SaaS is ready!"
echo "===================================="
echo ""
echo "🌐 Frontend: http://localhost:3001"
echo "🗄️  Supabase Studio: http://localhost:54323"
echo "📚 API Documentation: http://localhost:3001/api-docs"
echo ""
echo "📧 Test Login:"
echo "   Email: test@example.com"
echo "   Password: testpassword123"
echo ""
echo "📋 View logs: tail -f dev.log"
echo "🛑 To stop: ./stop-compliance-saas.command"
echo ""
echo "Press Enter to exit (server continues running)..."
read