# Local Testing Guide

Complete guide to testing Synapse locally before deploying to production.

---

## 🚀 Quick Local Test

**One command to start everything:**
```bash
make dev
```

This starts:
- PostgreSQL database
- Backend API (Go)
- Frontend (React/Vite)

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- API Docs: http://localhost:8080/api/docs/index.html

---

## 📋 Step-by-Step Local Setup

### 1. Prerequisites

**Required:**
- Docker & Docker Compose
- Go 1.21+ (for local development)
- Node.js 18+ (for local development)

**Check versions:**
```bash
docker --version
docker-compose --version
go version
node --version
```

### 2. Clone & Setup

```bash
# Already in /home/user/lexia
cd /home/user/lexia

# Create backend .env file
cp backend/.env.example backend/.env
```

### 3. Configure Environment

Edit `backend/.env`:
```bash
# Minimal config for local testing
PORT=8080
ENVIRONMENT=development

# Database (matches docker-compose.yml)
DB_HOST=localhost
DB_PORT=5432
DB_USER=synapse
DB_PASSWORD=synapse_dev_password
DB_NAME=lexia_db

# JWT (generate with: openssl rand -base64 32)
JWT_SECRET=local-dev-secret-change-in-production
JWT_ISSUER=synapse-local

# AI Keys (optional for testing core features)
CLAUDE_API_KEY=sk-ant-your-key-here
GEMINI_API_KEY=your-gemini-key-here
DEFAULT_AI_PROVIDER=claude

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Start Services

**Option A: Using Make (Recommended)**
```bash
make dev
```

**Option B: Using Docker Compose**
```bash
docker-compose up -d
```

**Option C: Manual (for development)**
```bash
# Terminal 1: Start database
docker-compose up postgres redis

# Terminal 2: Start backend
cd backend
go run cmd/api/main.go

# Terminal 3: Start frontend
cd frontend
npm install
npm run dev
```

### 5. Verify Services

```bash
# Check containers
docker ps

# Check health endpoints
curl http://localhost:8080/health
curl http://localhost:8080/ready
curl http://localhost:8080/live

# Check API docs
open http://localhost:8080/api/docs/index.html
```

### 6. Seed Demo Data

```bash
make seed-local
# Or manually:
cd backend
go run cmd/seed/main.go
```

This creates:
- 4 demo users (demo@synapse.app / Demo1234)
- 22 Finnish vocabulary words
- 4 sample quests

### 7. Test Frontend

Open http://localhost:5173

**Login:**
- Email: `demo@synapse.app`
- Password: `Demo1234`

**Test each feature:**
1. ✍️ **Scribe** - Write practice with AI quests
2. 🧠 **Synapse** - Mind map visualization
3. 🔍 **Lens** - Import content
4. 🗣️ **Orator** - Speaking practice
5. 📊 **Analytics** - Progress tracking

---

## 🧪 Testing Checklist

### Backend Tests

```bash
# Run all tests
make test

# Or manually
cd backend
go test -v ./...

# Test specific package
go test -v ./internal/handlers
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
# Health checks
make health

# Performance test
make perf
```

### Manual Testing

- [ ] **Registration** - Create new user
- [ ] **Login** - Login with demo user
- [ ] **Scribe** - Create quest, write, submit
- [ ] **Synapse** - View mind map, click nodes
- [ ] **Lens** - Import URL/text
- [ ] **Orator** - Test speech (requires HTTPS or localhost)
- [ ] **Analytics** - View stats, charts
- [ ] **Export** - Export data (JSON/CSV)
- [ ] **Import** - Import CSV
- [ ] **Onboarding** - First-time user tour

---

## 📊 Database Management

### Access Database

```bash
# Using Make
make db-shell

# Or directly
docker exec -it synapse-postgres psql -U synapse -d lexia_db
```

### Common SQL Queries

```sql
-- List all users
SELECT id, email, username FROM users;

-- Count words
SELECT COUNT(*) FROM words;

-- View quests
SELECT id, title, status FROM quests;

-- Check SRS data
SELECT word, ease_factor, interval FROM words WHERE user_id = 1;
```

### Reset Database

```bash
# Stop services
docker-compose down -v

# Restart (will recreate DB)
docker-compose up -d

# Seed again
make seed-local
```

### Backup Local Data

```bash
docker exec synapse-postgres pg_dump -U synapse lexia_db > backup-local.sql
```

### Restore Local Data

```bash
cat backup-local.sql | docker exec -i synapse-postgres psql -U synapse lexia_db
```

---

## 🔍 Debugging

### View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker logs -f synapse-backend

# Database only
docker logs -f synapse-postgres
```

### Backend Debug Mode

```bash
# Run with hot reload (air)
cd backend
go install github.com/cosmtrek/air@latest
air

# Or with delve debugger
go install github.com/go-delve/delve/cmd/dlv@latest
dlv debug cmd/api/main.go
```

### Frontend Debug Mode

```bash
cd frontend
npm run dev

# The Vite dev server has:
# - Hot module replacement
# - Source maps
# - React Developer Tools support
```

### Common Issues

**1. Port already in use:**
```bash
# Find process using port 8080
lsof -i :8080
# Kill it
kill -9 <PID>
```

**2. Database connection refused:**
```bash
# Check if postgres is running
docker ps | grep postgres
# Restart it
docker-compose restart postgres
```

**3. Frontend can't reach backend:**
```bash
# Check CORS settings in backend/.env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Restart backend
docker-compose restart backend
```

**4. Go modules issues:**
```bash
cd backend
go mod tidy
go mod download
```

**5. Node modules issues:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 Testing Specific Features

### Test Spaced Repetition (SM-2)

```bash
# Review a word multiple times
# Correct answers should increase interval
# Wrong answers should reset it

# Check in database:
docker exec -it synapse-postgres psql -U synapse -d lexia_db -c \
  "SELECT word, ease_factor, interval, next_review FROM words WHERE user_id = 1;"
```

### Test AI Integration

**Requires API keys in backend/.env**

1. **Claude (Scribe feedback)**
   - Create quest in Scribe
   - Submit writing
   - Check for AI feedback

2. **Gemini (Alternative)**
   - Change `DEFAULT_AI_PROVIDER=gemini`
   - Restart backend
   - Test same flow

3. **OpenAI Whisper (Orator speech-to-text)**
   - Go to Orator
   - Record speech
   - Check transcription

### Test Export/Import

```bash
# 1. Add some words
# 2. Export as JSON
curl -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/v1/export/json > export.json

# 3. Export as CSV
curl -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/v1/export/csv > export.csv

# 4. Import CSV (via UI or API)
curl -X POST -H "Authorization: Bearer <token>" \
  -F "file=@export.csv" \
  http://localhost:8080/api/v1/import/csv
```

### Test PWA Features

```bash
# Build production frontend locally
cd frontend
npm run build
npm run preview

# Test PWA install
# Open http://localhost:4173
# Click browser install prompt
```

---

## 📈 Performance Testing

### Backend Performance

```bash
# Test health endpoint
make perf

# Or with Apache Bench
ab -n 1000 -c 10 http://localhost:8080/health

# Test API endpoint
ab -n 100 -c 5 -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/v1/words
```

### Frontend Performance

```bash
# Build and analyze
cd frontend
npm run build
npm run analyze

# Check Lighthouse score
# Open Chrome DevTools > Lighthouse
# Run audit on http://localhost:4173
```

### Database Performance

```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔒 Security Testing

### Test Authentication

```bash
# 1. Register user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test1234"}'

# 2. Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# 3. Use token
TOKEN="<token-from-login>"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/words
```

### Test CORS

```bash
# Should allow localhost:5173
curl -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS http://localhost:8080/api/v1/words

# Should block other origins
curl -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS http://localhost:8080/api/v1/words
```

---

## ✅ Pre-Deployment Checklist

Before deploying to production VM, verify locally:

- [ ] All containers start successfully
- [ ] Health endpoints return 200
- [ ] Database seeder works
- [ ] User can register
- [ ] User can login
- [ ] All 5 features accessible
- [ ] API docs accessible
- [ ] Export/import works
- [ ] No console errors in browser
- [ ] No errors in backend logs
- [ ] Performance acceptable (<3s page load)
- [ ] Tests pass (`make test`)

---

## 🧹 Cleanup

### Stop Services

```bash
# Stop but keep data
make stop
# Or
docker-compose down

# Stop and remove volumes (deletes data!)
docker-compose down -v
```

### Clean Build Artifacts

```bash
make clean
```

### Full Reset

```bash
# Remove everything
docker-compose down -v
rm -rf frontend/node_modules frontend/dist
rm -rf backend/bin
make clean

# Start fresh
make dev
make seed-local
```

---

## 🚀 Ready for Production?

Once local testing passes:

1. **Review checklist above** ✅
2. **Run:** `make deploy`
3. **Monitor:** `make health` and `make logs`
4. **Seed production:** `make seed`

---

**Local Development Commands:**
```bash
make dev          # Start everything
make logs         # View logs
make status       # Check status
make seed-local   # Seed data
make test         # Run tests
make clean        # Clean up
```

**Troubleshooting:** See debugging section above
**Production Deploy:** See `DEPLOY_TO_VM.md`
