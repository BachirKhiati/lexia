#!/bin/bash

# Synapse Development Environment Setup Script
# This script sets up everything needed to run Synapse locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Synapse Development Setup            ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo
}

print_step() {
    echo -e "${GREEN}▶${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup
print_header

echo "This script will set up your Synapse development environment."
echo "It will install dependencies and configure everything for you."
echo

# 1. Check prerequisites
print_step "Checking prerequisites..."

MISSING_DEPS=()

if ! command_exists docker; then
    MISSING_DEPS+=("docker")
fi

if ! command_exists docker-compose || ! command_exists docker compose; then
    MISSING_DEPS+=("docker-compose")
fi

if ! command_exists go; then
    MISSING_DEPS+=("go")
fi

if ! command_exists node; then
    MISSING_DEPS+=("node")
fi

if ! command_exists npm; then
    MISSING_DEPS+=("npm")
fi

if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    print_error "Missing required dependencies:"
    for dep in "${MISSING_DEPS[@]}"; do
        echo "  - $dep"
    done
    echo
    echo "Please install missing dependencies and run this script again."
    echo "See README.md for installation instructions."
    exit 1
fi

print_success "All prerequisites found!"

# Check versions
GO_VERSION=$(go version | awk '{print $3}' | sed 's/go//')
NODE_VERSION=$(node --version | sed 's/v//')

echo "  Docker: $(docker --version | awk '{print $3}' | sed 's/,//')"
echo "  Docker Compose: $(docker compose version | awk '{print $4}')"
echo "  Go: $GO_VERSION"
echo "  Node.js: $NODE_VERSION"
echo

# 2. Create .env files if they don't exist
print_step "Setting up environment files..."

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success "Created .env from .env.example"
    else
        print_warning ".env.example not found, skipping root .env creation"
    fi
else
    print_warning ".env already exists, skipping"
fi

if [ ! -f backend/.env ]; then
    if [ -f backend/.env.example ]; then
        cp backend/.env.example backend/.env
        print_success "Created backend/.env from backend/.env.example"

        # Generate JWT secret
        JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
        sed -i.bak "s/CHANGE_ME_64_CHAR_MINIMUM_SECRET_HERE/$JWT_SECRET/" backend/.env
        rm backend/.env.bak 2>/dev/null || true
        print_success "Generated JWT secret"
    else
        print_warning "backend/.env.example not found, skipping"
    fi
else
    print_warning "backend/.env already exists, skipping"
fi

if [ ! -f frontend/.env ]; then
    if [ -f frontend/.env.example ]; then
        cp frontend/.env.example frontend/.env
        print_success "Created frontend/.env from frontend/.env.example"
    else
        print_warning "frontend/.env.example not found, skipping"
    fi
else
    print_warning "frontend/.env already exists, skipping"
fi

echo

# 3. Install backend dependencies
print_step "Installing backend dependencies..."
cd backend
go mod download
print_success "Backend dependencies installed"
cd ..
echo

# 4. Install frontend dependencies
print_step "Installing frontend dependencies..."
cd frontend
npm install
print_success "Frontend dependencies installed"
cd ..
echo

# 5. Start Docker services
print_step "Starting Docker services (PostgreSQL, Redis)..."

if docker compose ps | grep -q "Up"; then
    print_warning "Docker services already running"
else
    docker compose up -d postgres redis

    # Wait for PostgreSQL to be ready
    print_step "Waiting for PostgreSQL to be ready..."
    sleep 5

    until docker compose exec -T postgres pg_isready -U synapse_user >/dev/null 2>&1; do
        echo -n "."
        sleep 1
    done
    echo
    print_success "PostgreSQL is ready"
fi

echo

# 6. Initialize database
print_step "Initializing database schema..."

# The backend will auto-create tables on first run
print_success "Database will be initialized on first backend start"

echo

# 7. Print next steps
print_success "Setup complete! 🎉"
echo
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Next Steps:                                               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo
echo "1. Add your API keys to backend/.env:"
echo "   - CLAUDE_API_KEY (get from https://console.anthropic.com)"
echo "   - GEMINI_API_KEY (get from https://ai.google.dev)"
echo
echo "2. Start the backend:"
echo "   ${GREEN}cd backend && go run cmd/api/main.go${NC}"
echo "   Backend will run on http://localhost:8080"
echo
echo "3. Start the frontend (in a new terminal):"
echo "   ${GREEN}cd frontend && npm run dev${NC}"
echo "   Frontend will run on http://localhost:3000"
echo
echo "4. Open your browser:"
echo "   ${GREEN}http://localhost:3000${NC}"
echo
echo "Alternatively, run everything with Docker:"
echo "   ${GREEN}docker compose up${NC}"
echo
echo "For production deployment, see DEPLOYMENT.md"
echo
print_success "Happy coding! 🚀"
