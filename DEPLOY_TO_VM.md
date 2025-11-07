# Deploy Synapse to VM at 94.237.80.109

**Target Server**: 94.237.80.109
**OS**: Ubuntu 20.04+ (recommended)
**Estimated Time**: 30-60 minutes

---

## 🚀 Quick Deploy (Automated)

```bash
# From your local machine
./scripts/deploy-to-vm.sh 94.237.80.109
```

---

## 📋 Manual Deployment Steps

### Step 1: Prepare Your Local Machine

```bash
# 1. Ensure you have SSH access to the VM
ssh root@94.237.80.109
# Or with a specific key:
# ssh -i ~/.ssh/your-key.pem root@94.237.80.109

# 2. Test connection
exit

# 3. Make sure you're in the project directory
cd /home/user/lexia
```

---

### Step 2: Prepare the VM

SSH into your VM and run these commands:

```bash
ssh root@94.237.80.109

# Update system
apt-get update && apt-get upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version

# Install Git
apt-get install -y git

# Install Nginx (for reverse proxy)
apt-get install -y nginx

# Install Certbot (for SSL)
apt-get install -y certbot python3-certbot-nginx

# Create app directory
mkdir -p /opt/synapse
cd /opt/synapse

# Exit SSH for now
exit
```

---

### Step 3: Deploy Application Files

From your local machine:

```bash
# Copy project files to VM
rsync -avz --exclude 'node_modules' --exclude '.git' \
  /home/user/lexia/ root@94.237.80.109:/opt/synapse/

# Or if using SSH key:
# rsync -avz -e "ssh -i ~/.ssh/your-key.pem" \
#   --exclude 'node_modules' --exclude '.git' \
#   /home/user/lexia/ root@94.237.80.109:/opt/synapse/
```

---

### Step 4: Configure Environment Variables

SSH back into the VM:

```bash
ssh root@94.237.80.109
cd /opt/synapse

# Create production .env file
cp backend/.env.example backend/.env

# Edit the .env file
nano backend/.env
```

Update these values:

```bash
# Server
SERVER_PORT=8080
SERVER_ENV=production

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=synapse
DB_PASSWORD=GENERATE_STRONG_PASSWORD_HERE
DB_NAME=synapse
DB_SSLMODE=require

# JWT (generate with: openssl rand -base64 32)
JWT_SECRET=GENERATE_256_BIT_SECRET_HERE
JWT_ISSUER=synapse-production
JWT_EXPIRY=24h

# AI Services
CLAUDE_API_KEY=sk-ant-your-key-here
GEMINI_API_KEY=your-gemini-key-here
DEFAULT_AI_PROVIDER=claude

# Language
DEFAULT_LANGUAGE=finnish

# CORS (use your domain)
CORS_ALLOWED_ORIGINS=http://94.237.80.109,https://yourdomain.com
```

Generate secrets:

```bash
# Generate database password
openssl rand -base64 24

# Generate JWT secret
openssl rand -base64 32
```

Save and exit (Ctrl+X, Y, Enter)

---

### Step 5: Create Production Docker Compose

```bash
cd /opt/synapse

# Create production docker-compose file
nano docker-compose.prod.yml
```

Paste this configuration:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: synapse-postgres
    restart: always
    environment:
      POSTGRES_USER: synapse
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: synapse
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U synapse"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: synapse-backend
    restart: always
    env_file:
      - backend/.env
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "127.0.0.1:8080:8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    volumes:
      - ./logs:/app/logs

volumes:
  postgres_data:
    driver: local
```

---

### Step 6: Create Backend Dockerfile

```bash
nano backend/Dockerfile.prod
```

Paste:

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags="-s -w" -o main ./cmd/api

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates curl

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/main .

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Run
CMD ["./main"]
```

---

### Step 7: Build Frontend

```bash
cd /opt/synapse/frontend

# Install Node.js if not present
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install dependencies
npm install

# Build for production
npm run build

# Frontend built files are now in frontend/dist/
```

---

### Step 8: Configure Nginx

```bash
nano /etc/nginx/sites-available/synapse
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name 94.237.80.109;

    # Redirect to HTTPS (after SSL is set up)
    # return 301 https://$server_name$request_uri;

    # Root directory for frontend
    root /opt/synapse/frontend/dist;
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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
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
        try_files $uri $uri/ /index.html;
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
```

Enable the site:

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/synapse /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

### Step 9: Start Application

```bash
cd /opt/synapse

# Start Docker containers
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Wait for containers to be healthy (30-60 seconds)
```

---

### Step 10: Seed Demo Data (Optional)

```bash
cd /opt/synapse

# Seed database
docker exec synapse-backend ./main seed
# Or run the seeder script if available
```

---

### Step 11: Verify Deployment

```bash
# Check health endpoints
curl http://localhost:8080/health
curl http://localhost:8080/ready
curl http://localhost:8080/live

# Check from outside
curl http://94.237.80.109/health

# Test frontend
curl http://94.237.80.109/

# Check Docker containers
docker ps

# Check logs
docker logs synapse-backend
```

---

### Step 12: Setup SSL (Optional but Recommended)

If you have a domain name pointing to 94.237.80.109:

```bash
# Get SSL certificate
certbot --nginx -d yourdomain.com

# Follow the prompts
# Certbot will automatically configure Nginx for HTTPS

# Test auto-renewal
certbot renew --dry-run
```

If you don't have a domain yet, you can use the IP for now and add SSL later.

---

### Step 13: Setup Automatic Backups

```bash
# Create backup script
nano /opt/synapse/scripts/backup-production.sh
```

Paste:

```bash
#!/bin/bash
BACKUP_DIR="/opt/synapse/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/synapse_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

docker exec synapse-postgres pg_dump -U synapse synapse > $BACKUP_FILE
gzip $BACKUP_FILE

echo "Backup created: $BACKUP_FILE.gz"

# Keep only last 30 days
find $BACKUP_DIR -name "synapse_backup_*.sql.gz" -mtime +30 -delete
```

Make executable:

```bash
chmod +x /opt/synapse/scripts/backup-production.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /opt/synapse/scripts/backup-production.sh >> /var/log/synapse-backup.log 2>&1
```

---

### Step 14: Setup Firewall

```bash
# Install UFW
apt-get install -y ufw

# Allow SSH (IMPORTANT - don't lock yourself out!)
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS (if using SSL)
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

---

## 🔍 Access Your Application

### Frontend
- **URL**: http://94.237.80.109
- **With domain**: http://yourdomain.com (after DNS setup)

### Backend API
- **Health**: http://94.237.80.109/health
- **API Docs**: http://94.237.80.109/api/docs

### Login
- **Email**: demo@synapse.app
- **Password**: Demo1234

---

## 🛠️ Common Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Backend only
docker logs -f synapse-backend

# Postgres only
docker logs -f synapse-postgres
```

### Restart Services
```bash
cd /opt/synapse
docker-compose -f docker-compose.prod.yml restart
```

### Stop Services
```bash
cd /opt/synapse
docker-compose -f docker-compose.prod.yml down
```

### Update Application
```bash
# On local machine, push changes
git push

# On VM
cd /opt/synapse
git pull
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### Database Access
```bash
# Connect to database
docker exec -it synapse-postgres psql -U synapse -d synapse

# Run SQL
docker exec synapse-postgres psql -U synapse -d synapse -c "SELECT COUNT(*) FROM users;"
```

### Check Resource Usage
```bash
# Docker containers
docker stats

# System resources
htop
df -h
free -h
```

---

## 🔒 Security Checklist

- [ ] Changed default database password
- [ ] Generated strong JWT secret
- [ ] Configured firewall (UFW)
- [ ] Nginx security headers enabled
- [ ] SSL/HTTPS configured (if domain available)
- [ ] Regular backups scheduled
- [ ] Docker containers auto-restart on failure
- [ ] Non-root user for Docker (optional)
- [ ] SSH key authentication (disable password auth)
- [ ] Fail2ban installed (optional)

---

## 📊 Monitoring

### Health Check Script
```bash
# Create monitoring script
nano /opt/synapse/scripts/monitor.sh
```

Paste:

```bash
#!/bin/bash
curl -f http://localhost:8080/health || echo "Backend health check failed!"
curl -f http://localhost:80 || echo "Nginx health check failed!"
```

Make executable and add to crontab:

```bash
chmod +x /opt/synapse/scripts/monitor.sh

# Check every 5 minutes
crontab -e
# Add: */5 * * * * /opt/synapse/scripts/monitor.sh
```

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check logs
docker logs synapse-backend

# Check environment variables
docker exec synapse-backend env | grep -E "DB|JWT|API"

# Verify database connection
docker exec synapse-backend curl localhost:8080/health
```

### Can't access from browser
```bash
# Check Nginx
systemctl status nginx
nginx -t

# Check if port 80 is open
netstat -tulpn | grep :80

# Check firewall
ufw status

# Test locally
curl http://localhost
```

### Database connection errors
```bash
# Check if postgres is running
docker ps | grep postgres

# Check database logs
docker logs synapse-postgres

# Test connection
docker exec synapse-postgres psql -U synapse -d synapse -c "SELECT 1;"
```

---

## 📞 Next Steps

1. **Test the application**: http://94.237.80.109
2. **Setup domain** (optional): Point your domain to 94.237.80.109
3. **Configure SSL**: Run certbot after domain is configured
4. **Generate PWA screenshots**: Follow guide in `frontend/public/screenshots/README.md`
5. **Monitor for 24 hours**: Check logs and health endpoints
6. **Announce launch**: When ready! 🚀

---

**Server IP**: 94.237.80.109
**Status**: Ready for deployment
**Estimated Deploy Time**: 30-60 minutes
**Last Updated**: November 7, 2025
