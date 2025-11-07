#!/bin/bash

# Synapse Database Seeder
# Seeds the database with sample data for development and testing

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌱 Synapse Database Seeder${NC}"
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: backend directory not found${NC}"
    echo "   Please run this script from the project root"
    exit 1
fi

# Check if PostgreSQL is running
echo -e "${BLUE}🔍 Checking database connection...${NC}"
if ! docker-compose ps postgres | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  PostgreSQL container is not running${NC}"
    echo -e "${BLUE}   Starting PostgreSQL...${NC}"
    docker-compose up -d postgres
    echo -e "${GREEN}   Waiting for PostgreSQL to be ready...${NC}"
    sleep 3
fi

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo -e "${BLUE}   Copying from .env.example...${NC}"
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${GREEN}   ✅ Created .env file${NC}"
    else
        echo -e "${RED}❌ Error: .env.example not found${NC}"
        exit 1
    fi
fi

# Run the seeder
echo ""
echo -e "${BLUE}🚀 Running database seeder...${NC}"
echo ""

cd backend
go run cmd/seed/main.go

echo ""
echo -e "${GREEN}✅ Database seeding complete!${NC}"
echo ""
echo -e "${BLUE}📝 Demo Account Credentials:${NC}"
echo -e "   Email:    ${GREEN}demo@synapse.app${NC}"
echo -e "   Password: ${GREEN}Demo1234${NC}"
echo ""
echo -e "${BLUE}📊 Seeded Data:${NC}"
echo "   • 4 user accounts"
echo "   • 22 Finnish words (8 solid, 6 liquid, 8 ghost)"
echo "   • 4 quests (2 completed, 1 in progress, 1 pending)"
echo "   • Progress data with streak tracking"
echo ""
echo -e "${BLUE}🎯 Next Steps:${NC}"
echo "   1. Start the backend:  cd backend && go run cmd/api/main.go"
echo "   2. Start the frontend: cd frontend && npm run dev"
echo "   3. Login at http://localhost:5173/login"
echo ""
