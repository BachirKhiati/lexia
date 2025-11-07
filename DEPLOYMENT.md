# Synapse - Production Deployment Guide

This guide will help you deploy Synapse to production. Follow these steps carefully.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Docker Deployment](#docker-deployment)
5. [Nginx Configuration](#nginx-configuration)
6. [SSL/HTTPS Setup](#ssl-https-setup)
7. [Environment Variables](#environment-variables)
8. [Database Migrations](#database-migrations)
9. [Monitoring & Logging](#monitoring-logging)
10. [Backup Strategy](#backup-strategy)
11. [Security Checklist](#security-checklist)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying Synapse, ensure you have:

- A Linux server (Ubuntu 22.04+ recommended)
- Docker and Docker Compose installed
- Domain name (e.g., `synapse.yourdomain.com`)
- At least 2GB RAM, 2 CPU cores, 20GB storage
- PostgreSQL 15+ (can run in Docker)
- Redis 7+ (can run in Docker)

### Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

---

## Environment Setup

### 1. Clone the Repository

```bash
# Clone to your server
git clone https://github.com/YOUR_USERNAME/synapse.git
cd synapse

# Create production branch
git checkout -b production
```

### 2. Create Environment Files

```bash
# Backend environment
cp backend/.env.example backend/.env.production

# Frontend environment
cp frontend/.env.example frontend/.env.production
```

### 3. Configure Environment Variables

Edit `backend/.env.production`:

```bash
# Server Configuration
PORT=8080
ENV=production

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=synapse_prod
DB_USER=synapse_user
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD_HERE

# JWT Configuration
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY_HERE_64_CHARS_MIN
JWT_ISSUER=synapse-production

# AI Providers
CLAUDE_API_KEY=your_claude_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
DEFAULT_AI_PROVIDER=claude

# CORS
CORS_ALLOWED_ORIGINS=https://synapse.yourdomain.com

# Language
DEFAULT_LANGUAGE=finnish
```

Edit `frontend/.env.production`:

```bash
VITE_API_URL=https://api.synapse.yourdomain.com
VITE_APP_NAME=Synapse
VITE_ENV=production
```

---

## Database Setup

### Option 1: Docker PostgreSQL (Recommended)

The `docker-compose.prod.yml` includes PostgreSQL. Skip to Docker Deployment.

### Option 2: Managed Database (AWS RDS, DigitalOcean, etc.)

1. Create a PostgreSQL 15+ instance
2. Note the connection details
3. Update `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` in `.env.production`

### Database Initialization

The backend will automatically create tables on first run. To verify:

```bash
# Connect to database
docker exec -it synapse-postgres psql -U synapse_user -d synapse_prod

# Check tables
\dt

# Expected tables:
# - users
# - quests
# - words
# - word_conjugations
# - word_relations
# - articles
# - user_progress

# Exit
\q
```

---

## Docker Deployment

### 1. Review Production Docker Compose

See `docker-compose.prod.yml` for the production configuration.

### 2. Build and Deploy

```bash
# Build images
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### 3. Verify Services

```bash
# Check backend health
curl http://localhost:8080/health
# Expected: OK

# Check frontend
curl http://localhost:3000
# Expected: HTML response

# Check database
docker exec synapse-postgres pg_isready -U synapse_user
# Expected: accepting connections
```

---

## Nginx Configuration

### 1. Install Nginx

```bash
sudo apt install nginx -y
```

### 2. Create Nginx Configuration

Create `/etc/nginx/sites-available/synapse`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.synapse.yourdomain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name synapse.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Enable Configuration

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/synapse /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificates
sudo certbot --nginx -d synapse.yourdomain.com -d api.synapse.yourdomain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Redirect HTTP to HTTPS: Yes

# Auto-renewal is enabled by default
# Test renewal
sudo certbot renew --dry-run
```

### Verify HTTPS

```bash
# Visit your domain
https://synapse.yourdomain.com
https://api.synapse.yourdomain.com/health
```

---

## Environment Variables

### Production Security

**Critical:** Never commit `.env.production` to Git!

```bash
# Add to .gitignore (already included)
*.production
.env.production
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | 64+ character secret | Generate with `openssl rand -base64 64` |
| `DB_PASSWORD` | Strong database password | 20+ characters, mixed case, numbers, symbols |
| `REDIS_PASSWORD` | Redis password | 20+ characters |
| `CLAUDE_API_KEY` | Anthropic API key | `sk-ant-...` |
| `GEMINI_API_KEY` | Google Gemini key | `AIza...` |

### Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 64

# Generate database password
openssl rand -base64 32

# Generate Redis password
openssl rand -base64 32
```

---

## Database Migrations

### Initial Setup

The application automatically creates tables on first startup. However, for production, consider using explicit migrations.

### Manual Migration (if needed)

```bash
# Backup first!
docker exec synapse-postgres pg_dump -U synapse_user synapse_prod > backup_$(date +%Y%m%d).sql

# Connect to database
docker exec -it synapse-postgres psql -U synapse_user -d synapse_prod

# Run migration SQL (if you have migration files)
\i /path/to/migration.sql
```

### Adding SRS Fields (Already in schema)

The SRS fields are already in the schema. If updating from an older version:

```sql
-- Add SRS fields to words table
ALTER TABLE words ADD COLUMN IF NOT EXISTS ease_factor FLOAT NOT NULL DEFAULT 2.5;
ALTER TABLE words ADD COLUMN IF NOT EXISTS repetition_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE words ADD COLUMN IF NOT EXISTS interval INTEGER NOT NULL DEFAULT 0;
ALTER TABLE words ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMP;
ALTER TABLE words ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMP;
```

---

## Monitoring & Logging

### Application Logs

```bash
# View all logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Save logs to file
docker compose -f docker-compose.prod.yml logs > synapse_logs_$(date +%Y%m%d).txt
```

### System Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Monitor Docker resources
docker stats

# Monitor disk space
df -h

# Monitor logs size
du -sh /var/lib/docker/
```

### Log Rotation

Create `/etc/logrotate.d/synapse`:

```
/var/log/synapse/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0640 root root
}
```

### Health Checks

```bash
# Create health check script
cat > /usr/local/bin/synapse-health.sh << 'EOF'
#!/bin/bash
API_URL="https://api.synapse.yourdomain.com/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ Synapse API is healthy"
    exit 0
else
    echo "❌ Synapse API is down (HTTP $RESPONSE)"
    exit 1
fi
EOF

chmod +x /usr/local/bin/synapse-health.sh

# Add to cron (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/synapse-health.sh >> /var/log/synapse-health.log 2>&1") | crontab -
```

---

## Backup Strategy

### Database Backups

```bash
# Create backup script
cat > /usr/local/bin/synapse-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/synapse"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker exec synapse-postgres pg_dump -U synapse_user synapse_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "✅ Backup completed: db_$DATE.sql.gz"
EOF

chmod +x /usr/local/bin/synapse-backup.sh

# Schedule daily backups at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/synapse-backup.sh >> /var/log/synapse-backup.log 2>&1") | crontab -
```

### Restore from Backup

```bash
# Stop backend
docker compose -f docker-compose.prod.yml stop backend

# Restore database
gunzip < /var/backups/synapse/db_20250107_020000.sql.gz | docker exec -i synapse-postgres psql -U synapse_user synapse_prod

# Start backend
docker compose -f docker-compose.prod.yml start backend
```

---

## Security Checklist

- [ ] **Environment Variables**: All secrets in `.env.production`, not committed
- [ ] **SSL/HTTPS**: Let's Encrypt certificates installed
- [ ] **Firewall**: UFW enabled, only ports 80, 443, 22 open
- [ ] **Database**: Strong passwords, no public access
- [ ] **JWT Secret**: 64+ character random string
- [ ] **CORS**: Only allow your domain
- [ ] **Rate Limiting**: Consider adding rate limiting (TODO)
- [ ] **SSH Keys**: Disable password authentication
- [ ] **Updates**: Keep system packages updated
- [ ] **Backups**: Daily automated backups enabled
- [ ] **Monitoring**: Health checks and alerting configured

### Firewall Setup

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (change 22 if using custom port)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs backend

# Common issues:
# 1. Database connection failed → Check DB credentials
# 2. Port already in use → Change PORT in .env
# 3. Missing API keys → Add Claude/Gemini keys
```

### Frontend Can't Connect to Backend

```bash
# Check VITE_API_URL in frontend/.env.production
# Should match your API domain: https://api.synapse.yourdomain.com

# Rebuild frontend
docker compose -f docker-compose.prod.yml build frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

### Database Connection Issues

```bash
# Test connection
docker exec synapse-postgres psql -U synapse_user -d synapse_prod -c "SELECT 1;"

# Check PostgreSQL logs
docker compose -f docker-compose.prod.yml logs postgres
```

### SSL Certificate Issues

```bash
# Renew certificates manually
sudo certbot renew

# Check certificate expiry
sudo certbot certificates
```

### High Memory Usage

```bash
# Check Docker stats
docker stats

# Restart services
docker compose -f docker-compose.prod.yml restart

# Prune unused data
docker system prune -a
```

---

## Updating Synapse

### Pull Latest Changes

```bash
cd synapse

# Pull updates
git pull origin production

# Rebuild and redeploy
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Check logs
docker compose -f docker-compose.prod.yml logs -f
```

### Zero-Downtime Deployment (Advanced)

Use Docker Swarm or Kubernetes for zero-downtime deployments.

---

## Performance Tuning

### PostgreSQL Optimization

Edit PostgreSQL configuration in `docker-compose.prod.yml`:

```yaml
environment:
  - POSTGRES_INITDB_ARGS=-E UTF8 --locale=C
command: >
  postgres
  -c shared_buffers=256MB
  -c effective_cache_size=1GB
  -c max_connections=100
```

### Nginx Caching

Add to Nginx config:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_methods GET HEAD;
    # ... rest of proxy config
}
```

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/YOUR_USERNAME/synapse/issues
- Documentation: https://docs.synapse.app
- Email: support@yourdomain.com

---

## License

MIT License - See LICENSE file for details

---

**Congratulations!** 🎉 Synapse is now running in production!

Visit your application at: `https://synapse.yourdomain.com`
