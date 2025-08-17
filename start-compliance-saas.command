#!/bin/bash

# EN13813 Compliance SaaS - Startup Script for macOS
# This script starts all necessary services for the application

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

clear
echo "🚀 EN13813 Compliance SaaS - Starting Application"
echo "================================================"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}Port $port is already in use. Killing process...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null
        sleep 1
    fi
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    echo "Visit: https://nodejs.org/"
    exit 1
fi

if ! command_exists pnpm; then
    echo -e "${RED}❌ pnpm is not installed. Installing pnpm...${NC}"
    npm install -g pnpm
fi

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker Desktop first.${NC}"
    echo "Visit: https://www.docker.com/products/docker-desktop"
    exit 1
fi

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

echo -e "${GREEN}✅ All prerequisites are installed${NC}"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -d "apps/web/node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi
echo ""

# Start Supabase
echo "🗄️  Starting Supabase..."

# Check if Supabase is already running
if pnpm supabase status 2>/dev/null | grep -q "RUNNING"; then
    echo -e "${GREEN}✅ Supabase is already running${NC}"
else
    # Kill any processes on Supabase ports
    kill_port 54321
    kill_port 54322
    kill_port 54323
    kill_port 54324
    kill_port 54325
    kill_port 54326
    
    pnpm supabase start
    
    # Wait for Supabase to be ready
    echo "Waiting for Supabase to be ready..."
    sleep 5
    
    # Run migrations
    echo "🔄 Running database migrations..."
    pnpm supabase db reset --debug
    
    # Generate types
    echo "🔧 Generating TypeScript types..."
    pnpm gen:types
    
    echo -e "${GREEN}✅ Supabase started and migrations applied${NC}"
fi
echo ""

# Get Supabase credentials
echo "🔑 Supabase Credentials:"
echo "========================"
pnpm supabase status | grep -E "(API URL|anon key|service_role key)"
echo ""

# Start the development server
echo "🌐 Starting Next.js development server..."

# Kill any process on port 3001
kill_port 3001

# Start the dev server in a new Terminal window
osascript <<EOF
tell application "Terminal"
    do script "cd '$DIR' && pnpm dev"
    activate
end tell
EOF

# Wait a moment for the server to start
sleep 3

# Open the application in the browser
echo ""
echo -e "${GREEN}✨ Application is starting!${NC}"
echo ""
echo "📱 Opening in browser..."
sleep 2
open http://localhost:3001

# Show access information
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
echo "🛑 To stop all services:"
echo "   1. Close this terminal window"
echo "   2. Close the Next.js terminal window"
echo "   3. Run: pnpm supabase stop"
echo ""
echo "Press any key to view logs..."
read -n 1

# Show logs
echo ""
echo "📋 Showing Supabase logs (Press Ctrl+C to exit):"
echo "================================================"
pnpm supabase logs -f