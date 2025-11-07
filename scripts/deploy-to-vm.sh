#!/bin/bash

# Synapse Automated Deployment Script for VM
# Target: 94.237.80.109
# Usage: ./scripts/deploy-to-vm.sh [VM_IP] [SSH_USER]

set -e  # Exit on any error

# Configuration
VM_IP="${1:-94.237.80.109}"
SSH_USER="${2:-root}"
APP_DIR="/opt/synapse"
LOCAL_DIR="/home/user/lexia"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

run_remote() {
    ssh "$SSH_USER@$VM_IP" "$1"
}

# Banner
echo ""
echo "╔════════════════════════════════════════╗"
echo "║  Synapse Automated Deployment         ║"
echo "╚════════════════════════════════════════╝"
echo ""
log_info "Target VM: $VM_IP"
log_info "SSH User: $SSH_USER"
log_info "App Directory: $APP_DIR"
echo ""

# Step 1: Check SSH connectivity
log_info "Step 1/10: Checking SSH connectivity..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$VM_IP" exit 2>/dev/null; then
    log_error "Cannot connect to $VM_IP via SSH"
    log_info "Make sure you have SSH access configured:"
    echo "  ssh $SSH_USER@$VM_IP"
    echo "Or:"
    echo "  ssh-copy-id $SSH_USER@$VM_IP"
    exit 1
fi
log_success "SSH connection verified"

# Step 2: Check local project directory
log_info "Step 2/10: Verifying local project..."
if [ ! -d "$LOCAL_DIR" ]; then
    log_error "Local project directory not found: $LOCAL_DIR"
    exit 1
fi
if [ ! -f "$LOCAL_DIR/backend/go.mod" ] || [ ! -f "$LOCAL_DIR/frontend/package.json" ]; then
    log_error "Invalid project structure in $LOCAL_DIR"
    exit 1
fi
log_success "Local project verified"

# Step 3: Install dependencies on VM
log_info "Step 3/10: Installing dependencies on VM..."
run_remote "bash -s" <<'ENDSSH'
    set -e

    # Update system
    echo "Updating system packages..."
    apt-get update -qq

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "Installing Docker..."
        curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
        sh /tmp/get-docker.sh
        rm /tmp/get-docker.sh
    else
        echo "Docker already installed"
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        echo "Installing Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    else
        echo "Docker Compose already installed"
    fi

    # Install Nginx
    if ! command -v nginx &> /dev/null; then
        echo "Installing Nginx..."
        apt-get install -y nginx
    else
        echo "Nginx already installed"
    fi

    # Install Git
    if ! command -v git &> /dev/null; then
        echo "Installing Git..."
        apt-get install -y git
    else
        echo "Git already installed"
    fi

    # Install Node.js (for frontend build)
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    else
        echo "Node.js already installed"
    fi

    echo "Dependencies installation complete"
ENDSSH
log_success "Dependencies installed"

# Step 4: Create app directory
log_info "Step 4/10: Creating application directory..."
run_remote "mkdir -p $APP_DIR"
log_success "Application directory created"

# Step 5: Copy project files
log_info "Step 5/10: Copying project files to VM..."
log_warning "This may take a few minutes..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'frontend/dist' \
    --exclude 'backend/main' \
    --exclude '*.log' \
    --exclude '.env' \
    "$LOCAL_DIR/" "$SSH_USER@$VM_IP:$APP_DIR/"
log_success "Project files copied"

# Step 6: Create production environment file
log_info "Step 6/10: Configuring environment variables..."

# Generate secrets
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-32)
JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-43)

log_warning "Please enter your API keys (or press Enter to skip and configure manually later)"
read -p "Claude API Key (sk-ant-...): " CLAUDE_API_KEY
read -p "Gemini API Key: " GEMINI_API_KEY

# Create .env file on VM
run_remote "cat > $APP_DIR/backend/.env" <<ENVFILE
# Server Configuration
SERVER_PORT=8080
SERVER_ENV=production
SERVER_HOST=0.0.0.0

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=synapse
DB_PASSWORD=$DB_PASSWORD
DB_NAME=synapse
DB_SSLMODE=disable

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_ISSUER=synapse-production
JWT_EXPIRY=24h

# AI Services
CLAUDE_API_KEY=${CLAUDE_API_KEY:-your-claude-api-key-here}
GEMINI_API_KEY=${GEMINI_API_KEY:-your-gemini-api-key-here}
DEFAULT_AI_PROVIDER=claude

# Language
DEFAULT_LANGUAGE=finnish

# CORS
CORS_ALLOWED_ORIGINS=http://$VM_IP,https://$VM_IP

# Logging
LOG_LEVEL=info
ENVFILE

log_success "Environment configured"
log_info "Database password: $DB_PASSWORD"
log_info "JWT secret: $JWT_SECRET"
log_warning "Save these credentials securely!"

# Step 7: Build frontend on VM
log_info "Step 7/10: Building frontend..."
run_remote "cd $APP_DIR/frontend && npm install && npm run build"
log_success "Frontend built"

# Step 8: Start Docker containers
log_info "Step 8/10: Starting Docker containers..."
run_remote "cd $APP_DIR && docker-compose -f docker-compose.prod.yml up -d --build"
log_success "Docker containers started"

# Wait for containers to be healthy
log_info "Waiting for containers to be healthy (30 seconds)..."
sleep 30

# Step 9: Configure Nginx
log_info "Step 9/10: Configuring Nginx..."
run_remote "bash -s" <<ENDSSH
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/synapse <<'NGINXCONF'
server {
    listen 80;
    server_name $VM_IP;

    # Root directory for frontend
    root $APP_DIR/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;

    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health endpoints
    location ~ ^/(health|ready|live) {
        proxy_pass http://127.0.0.1:8080;
    }

    # Swagger docs
    location /api/docs {
        proxy_pass http://127.0.0.1:8080;
    }

    # Frontend SPA
    location / {
        try_files \$uri \$uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, immutable";
    }

    # Static assets with long cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
NGINXCONF

    # Enable site
    ln -sf /etc/nginx/sites-available/synapse /etc/nginx/sites-enabled/synapse

    # Remove default site
    rm -f /etc/nginx/sites-enabled/default

    # Test configuration
    nginx -t

    # Reload Nginx
    systemctl reload nginx
ENDSSH
log_success "Nginx configured"

# Step 10: Verify deployment
log_info "Step 10/10: Verifying deployment..."

# Check health endpoints
sleep 5
if curl -f -s "http://$VM_IP/health" > /dev/null; then
    log_success "Health endpoint responding"
else
    log_error "Health endpoint not responding"
    log_warning "Check logs with: ssh $SSH_USER@$VM_IP 'cd $APP_DIR && docker-compose -f docker-compose.prod.yml logs'"
fi

# Final summary
echo ""
echo "╔════════════════════════════════════════╗"
echo "║  Deployment Complete! 🚀               ║"
echo "╚════════════════════════════════════════╝"
echo ""
log_success "Synapse deployed successfully to $VM_IP"
echo ""
echo "📱 Access your application:"
echo "  Frontend:  http://$VM_IP"
echo "  API Docs:  http://$VM_IP/api/docs/index.html"
echo "  Health:    http://$VM_IP/health"
echo ""
echo "🔑 Demo Login Credentials:"
echo "  Email:     demo@synapse.app"
echo "  Password:  Demo1234"
echo ""
echo "📋 Next Steps:"
echo "  1. Seed demo data: ssh $SSH_USER@$VM_IP 'cd $APP_DIR && docker exec synapse-backend ./main seed'"
echo "  2. Setup SSL (if you have a domain): ssh $SSH_USER@$VM_IP 'certbot --nginx -d yourdomain.com'"
echo "  3. Configure firewall: ssh $SSH_USER@$VM_IP 'ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable'"
echo "  4. Setup backups: See DEPLOY_TO_VM.md Step 13"
echo ""
echo "📊 Monitor your deployment:"
echo "  View logs:     ssh $SSH_USER@$VM_IP 'cd $APP_DIR && docker-compose -f docker-compose.prod.yml logs -f'"
echo "  Check status:  ssh $SSH_USER@$VM_IP 'cd $APP_DIR && docker-compose -f docker-compose.prod.yml ps'"
echo "  Restart:       ssh $SSH_USER@$VM_IP 'cd $APP_DIR && docker-compose -f docker-compose.prod.yml restart'"
echo ""
log_info "Deployment completed at $(date)"
