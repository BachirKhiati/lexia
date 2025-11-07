# Synapse Production Deployment Guide

**Version**: 1.0.0
**Last Updated**: November 7, 2025
**Status**: Production Ready ✅

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Docker Deployment](#docker-deployment)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Database Setup](#database-setup)
7. [SSL/HTTPS Configuration](#sslhttps-configuration)
8. [Environment Variables](#environment-variables)
9. [Monitoring & Logging](#monitoring--logging)
10. [Backup & Recovery](#backup--recovery)
11. [Scaling](#scaling)
12. [Security Checklist](#security-checklist)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Synapse is a full-stack language learning platform with:
- **Backend**: Go (port 8080)
- **Frontend**: React + Vite (port 5173 dev, served via backend in production)
- **Database**: PostgreSQL (port 5432)
- **AI Services**: Claude API (Anthropic) + Gemini API (Google)

### Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Nginx     │─────▶│   Backend   │─────▶│  PostgreSQL │
│  (Reverse   │      │   (Go API)  │      │  (Database) │
│   Proxy)    │      │             │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
      │                     │
      │                     ▼
      │              ┌─────────────┐
      │              │  AI APIs    │
      │              │ Claude/Gemini│
      │              └─────────────┘
      ▼
┌─────────────┐
│  Frontend   │
│ Static Files│
└─────────────┘
```

---

## ✅ Prerequisites

### Required
- **Server**: Linux (Ubuntu 20.04+ or similar)
- **Docker**: 20.10+
- **Docker Compose**: 1.29+
- **Minimum Resources**:
  - 2 CPU cores
  - 4GB RAM
  - 20GB storage
- **Domain**: Registered domain name
- **SSL Certificate**: Let's Encrypt or commercial

### Recommended
- 4 CPU cores
- 8GB RAM
- 50GB storage (SSD preferred)
- Load balancer for high availability
- CDN for static assets

### API Keys Required
- **Claude API Key**: From Anthropic (https://console.anthropic.com)
- **Gemini API Key**: From Google AI Studio (https://makersuite.google.com)

---

## 🔧 Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/BachirKhiati/lexia.git
cd lexia
```

### 2. Create Production Environment File

```bash
cp backend/.env.example backend/.env
```

### 3. Configure Environment Variables

Edit `backend/.env`:

```bash
# Server Configuration
SERVER_PORT=8080
SERVER_ENV=production

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=synapse
DB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD
DB_NAME=synapse
DB_SSLMODE=require

# JWT Configuration
JWT_SECRET=GENERATE_STRONG_SECRET_HERE
JWT_ISSUER=synapse-production
JWT_EXPIRY=24h

# AI Service Configuration
CLAUDE_API_KEY=sk-ant-xxxxx
GEMINI_API_KEY=xxxxx
DEFAULT_AI_PROVIDER=claude

# Language Configuration
DEFAULT_LANGUAGE=finnish

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=1m
```

### Generate Secure Secrets

```bash
# Generate JWT secret (256-bit)
openssl rand -base64 32

# Generate database password
openssl rand -base64 24
```

---

## 🐳 Docker Deployment

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: synapse-postgres
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
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

  nginx:
    image: nginx:alpine
    container_name: synapse-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./frontend/dist:/usr/share/nginx/html:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - backend

volumes:
  postgres_data:
    driver: local
```

### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
# Multi-stage build for optimal size
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
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/api

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

### Deploy with Docker Compose

```bash
# Build frontend
cd frontend
npm install
npm run build

# Start services
cd ..
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check health
curl http://localhost:8080/health
```

---

## ☸️ Kubernetes Deployment

### Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: synapse-prod
```

### ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: synapse-config
  namespace: synapse-prod
data:
  SERVER_PORT: "8080"
  DB_HOST: "postgres-service"
  DB_PORT: "5432"
  DB_NAME: "synapse"
  DEFAULT_LANGUAGE: "finnish"
  DEFAULT_AI_PROVIDER: "claude"
```

### Secrets

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: synapse-secrets
  namespace: synapse-prod
type: Opaque
stringData:
  DB_PASSWORD: "your-secure-password"
  JWT_SECRET: "your-jwt-secret"
  CLAUDE_API_KEY: "your-claude-key"
  GEMINI_API_KEY: "your-gemini-key"
```

### PostgreSQL Deployment

```yaml
# k8s/postgres.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: synapse-prod
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: synapse-prod
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          valueFrom:
            configMapKeyRef:
              name: synapse-config
              key: DB_NAME
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: synapse-secrets
              key: DB_PASSWORD
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        livenessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - synapse
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - synapse
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: synapse-prod
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  type: ClusterIP
```

### Backend Deployment

```yaml
# k8s/backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: synapse-backend
  namespace: synapse-prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: synapse-backend
  template:
    metadata:
      labels:
        app: synapse-backend
    spec:
      containers:
      - name: backend
        image: yourdockerhub/synapse-backend:latest
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: synapse-config
        - secretRef:
            name: synapse-secrets
        livenessProbe:
          httpGet:
            path: /live
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: synapse-prod
spec:
  selector:
    app: synapse-backend
  ports:
  - port: 8080
    targetPort: 8080
  type: ClusterIP
```

### Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: synapse-ingress
  namespace: synapse-prod
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - synapse.yourdomain.com
    secretName: synapse-tls
  rules:
  - host: synapse.yourdomain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

### Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/ingress.yaml

# Check status
kubectl get pods -n synapse-prod
kubectl get services -n synapse-prod
kubectl get ingress -n synapse-prod

# View logs
kubectl logs -f deployment/synapse-backend -n synapse-prod
```

---

## 🗄️ Database Setup

### Initial Schema

The backend automatically initializes the schema on startup via `db.InitSchema()`.

### Manual Migration

```bash
# Connect to database
docker exec -it synapse-postgres psql -U synapse -d synapse

# Or in Kubernetes
kubectl exec -it postgres-0 -n synapse-prod -- psql -U synapse -d synapse
```

### Backup Script

Create `scripts/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/synapse_backup_$DATE.sql"

docker exec synapse-postgres pg_dump -U synapse synapse > $BACKUP_FILE
gzip $BACKUP_FILE

echo "Backup created: $BACKUP_FILE.gz"

# Keep only last 30 days
find $BACKUP_DIR -name "synapse_backup_*.sql.gz" -mtime +30 -delete
```

### Restore

```bash
# Restore from backup
gunzip < backup/synapse_backup_20251107.sql.gz | \
  docker exec -i synapse-postgres psql -U synapse synapse
```

---

## 🔒 SSL/HTTPS Configuration

### Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name synapse.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name synapse.yourdomain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Root directory
        root /usr/share/nginx/html;
        index index.html;

        # API proxy
        location /api {
            limit_req zone=api burst=20 nodelay;

            proxy_pass http://backend:8080;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Health endpoints (no rate limit)
        location ~ ^/(health|ready|live) {
            proxy_pass http://backend:8080;
        }

        # Login rate limiting
        location /api/v1/auth/login {
            limit_req zone=login burst=3 nodelay;
            proxy_pass http://backend:8080;
        }

        # Frontend
        location / {
            try_files $uri $uri/ /index.html;
            expires 1h;
            add_header Cache-Control "public, immutable";
        }

        # Static assets caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Let's Encrypt SSL

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d synapse.yourdomain.com

# Auto-renewal (cron)
sudo certbot renew --dry-run
```

---

## 🔑 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SERVER_PORT` | Backend port | `8080` |
| `DB_HOST` | PostgreSQL host | `postgres` |
| `DB_PASSWORD` | Database password | Strong random password |
| `JWT_SECRET` | JWT signing key | 256-bit random string |
| `CLAUDE_API_KEY` | Anthropic API key | `sk-ant-xxxxx` |
| `GEMINI_API_KEY` | Google Gemini key | `xxxxx` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_ENV` | Environment | `development` |
| `JWT_EXPIRY` | Token expiration | `24h` |
| `DEFAULT_LANGUAGE` | Default language | `finnish` |
| `RATE_LIMIT_ENABLED` | Enable rate limiting | `true` |

---

## 📊 Monitoring & Logging

### Health Endpoints

- `GET /health` - Overall health status
- `GET /ready` - Readiness probe (K8s)
- `GET /live` - Liveness probe (K8s)
- `GET /api/v1/system/stats` - System metrics (auth required)

### Prometheus Metrics

Install Prometheus monitoring:

```yaml
# k8s/prometheus.yaml
apiVersion: v1
kind: ServiceMonitor
metadata:
  name: synapse-backend
  namespace: synapse-prod
spec:
  selector:
    matchLabels:
      app: synapse-backend
  endpoints:
  - port: metrics
    interval: 30s
```

### Logging

```bash
# Docker logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Kubernetes logs
kubectl logs -f deployment/synapse-backend -n synapse-prod

# Centralized logging (optional)
# Use ELK stack, Loki, or cloud provider logging
```

---

## 💾 Backup & Recovery

### Automated Backups

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/scripts/backup-db.sh

# Weekly full backup at Sunday 3 AM
0 3 * * 0 /path/to/scripts/full-backup.sh
```

### Disaster Recovery

```bash
# 1. Stop services
docker-compose -f docker-compose.prod.yml down

# 2. Restore database
gunzip < backup/latest.sql.gz | \
  docker exec -i synapse-postgres psql -U synapse synapse

# 3. Restart services
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale backend pods (Kubernetes)
kubectl scale deployment synapse-backend --replicas=5 -n synapse-prod

# Docker Compose scaling
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Database Scaling

For high traffic, consider:
- Read replicas for PostgreSQL
- Connection pooling (PgBouncer)
- Caching layer (Redis)

---

## ✅ Security Checklist

- [ ] Strong passwords for database and JWT
- [ ] SSL/TLS enabled with valid certificates
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Firewall rules configured
- [ ] Regular security updates
- [ ] Database backups automated
- [ ] API keys stored as secrets
- [ ] Environment variables not in version control
- [ ] HTTPS redirect enabled
- [ ] Security headers configured
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection enabled
- [ ] CSRF protection for state-changing operations

---

## 🔧 Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker logs synapse-backend

# Common issues:
# - Database not ready: Wait for postgres health check
# - Missing env vars: Check .env file
# - Port conflict: Check if 8080 is available
```

### Database Connection Issues

```bash
# Test connection
docker exec synapse-backend psql -h postgres -U synapse -d synapse

# Check credentials in .env
# Verify postgres is running: docker ps
```

### SSL Certificate Issues

```bash
# Renew Let's Encrypt
sudo certbot renew

# Check certificate expiry
openssl x509 -in /etc/nginx/ssl/fullchain.pem -noout -dates
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Check database queries
docker exec synapse-postgres pg_stat_statements

# Enable query logging temporarily
```

---

## 📞 Support

- **Documentation**: See `/docs` folder
- **Health Check**: `curl https://yourdomain.com/health`
- **API Docs**: `https://yourdomain.com/api/docs`
- **Issues**: GitHub Issues

---

**Last Updated**: November 7, 2025
**Maintained By**: Synapse Team
**License**: MIT
