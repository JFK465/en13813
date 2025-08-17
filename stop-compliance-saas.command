#!/bin/bash

# EN13813 Compliance SaaS - Stop Script for macOS
# This script stops all running services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

clear
echo "🛑 EN13813 Compliance SaaS - Stopping Application"
echo "================================================"
echo ""

# Function to kill process on port
kill_port() {
    local port=$1
    local name=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}Stopping $name on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✅ $name stopped${NC}"
    else
        echo -e "${GREEN}✅ $name is not running${NC}"
    fi
}

# Stop Next.js development server
echo "🌐 Stopping Next.js server..."
kill_port 3001 "Next.js"
echo ""

# Stop Supabase
echo "🗄️  Stopping Supabase..."
if pnpm supabase status 2>/dev/null | grep -q "RUNNING"; then
    pnpm supabase stop
    echo -e "${GREEN}✅ Supabase stopped${NC}"
else
    echo -e "${GREEN}✅ Supabase is not running${NC}"
fi
echo ""

# Clean up any remaining Docker containers
echo "🧹 Cleaning up Docker containers..."
docker ps -q --filter "name=supabase" | xargs -r docker stop 2>/dev/null
docker ps -aq --filter "name=supabase" | xargs -r docker rm 2>/dev/null
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

echo "✨ All services have been stopped!"
echo ""
echo "To start again, run: ./start-compliance-saas.command"
echo ""
echo "Press any key to exit..."
read -n 1