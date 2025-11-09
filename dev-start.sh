#!/bin/bash

# Lexia Development Start Script
# Runs backend + databases in Docker, frontend locally

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Starting Lexia Development Server    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo

# 1. Start Docker services (backend + databases)
echo -e "${GREEN}▶${NC} Starting backend, PostgreSQL, and Redis in Docker..."
docker compose up -d postgres redis backend

# 2. Wait for services to be healthy
echo -e "${GREEN}▶${NC} Waiting for services to be ready..."
sleep 3

# Check if services are running
if ! docker compose ps | grep -q "lexia-backend.*Up"; then
    echo -e "${YELLOW}⚠${NC} Backend is not running yet, waiting..."
    sleep 5
fi

echo -e "${GREEN}✓${NC} Docker services are ready!"
echo

# 3. Show service URLs
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Services Running:                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo
echo "  🐘 PostgreSQL: localhost:5432"
echo "  🔴 Redis:      localhost:6379"
echo "  🔧 Backend:    http://localhost:8080"
echo

# 4. Start frontend locally
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Starting Frontend (Local)             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo
echo -e "${GREEN}▶${NC} Frontend will start on http://localhost:3000"
echo

cd frontend
npm run dev
