# Synapse Quick Start Guide 🚀

**Get up and running in 5 minutes!**

---

## 📦 What You Need

- **Go** 1.21+ (`go version`)
- **Node.js** 18+ (`node --version`)
- **PostgreSQL** 15+ (`psql --version`)
- **Docker** (optional, for easier setup)

---

## 🚀 5-Minute Setup

### Option 1: Using Docker (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/BachirKhiati/lexia.git
cd lexia

# 2. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys (Claude, Gemini)

# 3. Start everything
docker-compose up -d

# 4. Seed demo data
./seed-database.sh

# 5. Open in browser
# Frontend: http://localhost:5173
# Backend: http://localhost:8080
# API Docs: http://localhost:8080/api/docs
```

### Option 2: Manual Setup

```bash
# 1. Clone repository
git clone https://github.com/BachirKhiati/lexia.git
cd lexia

# 2. Setup database
createdb synapse
# Or: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15

# 3. Configure backend
cp backend/.env.example backend/.env
# Edit backend/.env:
#   - Set DB_HOST, DB_USER, DB_PASSWORD
#   - Add Claude API key (sk-ant-...)
#   - Add Gemini API key
#   - Generate JWT secret: openssl rand -base64 32

# 4. Start backend
cd backend
go mod download
go run cmd/api/main.go
# Backend running on http://localhost:8080

# 5. Start frontend (new terminal)
cd frontend
npm install
npm run dev
# Frontend running on http://localhost:5173

# 6. Seed demo data (new terminal)
./seed-database.sh
```

---

## 🎯 First Steps

### 1. Login with Demo Account

```
Email: demo@synapse.app
Password: Demo1234
```

### 2. Take the Tour

- The onboarding tour will start automatically
- Click through all 8 steps to learn the features
- Or click "Skip Tour" and explore on your own

### 3. Try Each Feature

**The Scribe** (✍️)
1. Click "The Scribe" in navigation
2. Click "Generate New Quest"
3. Write a response
4. Submit for AI feedback

**The Synapse** (🧠)
1. Click "The Synapse" in navigation
2. View your mind map
3. Click nodes to see word details
4. Watch ghost → liquid → solid progression

**The Lens** (🌍)
1. Click "The Lens" in navigation
2. Paste a Finnish article URL
3. Extract vocabulary
4. Add words to your Synapse

**The Orator** (🗣️)
1. Click "The Orator" in navigation
2. Allow microphone permission
3. Practice pronunciation
4. Have AI conversation

**Analytics** (📊)
1. Click "Analytics" in navigation
2. View learning statistics
3. See progress charts
4. Check challenging words

**Export/Import** (💾)
1. Click "Export/Import" in navigation
2. Export your data as JSON or CSV
3. Import vocabulary from CSV

---

## 🧪 Testing Your Setup

### Health Checks

```bash
# Check if backend is running
curl http://localhost:8080/health

# Check all health endpoints
./scripts/health-check.sh

# Run performance test
./scripts/perf-test.sh
```

### Test Features

```bash
# 1. Can you register a new account?
# 2. Can you login?
# 3. Does the onboarding tour show?
# 4. Can you generate a quest?
# 5. Can you view the mind map?
# 6. Can you export your data?
```

---

## 📚 Key Documentation

| Document | Purpose | Time to Read |
|----------|---------|--------------|
| `README.md` | Overview & features | 10 min |
| `PRODUCTION_DEPLOYMENT.md` | Deploy to production | 30 min |
| `TESTING_GUIDE.md` | Test before launch | 20 min |
| `PRE_LAUNCH_CHECKLIST.md` | Launch preparation | 15 min |
| `FINAL_SESSION_SUMMARY.md` | What was built | 15 min |

---

## 🎓 Learning Path

### Week 1: Explore
- ✅ Install and run locally
- ✅ Login with demo account
- ✅ Complete onboarding tour
- ✅ Try each of the 5 features
- ✅ Add 10 words to your Synapse
- ✅ Complete 2 quests

### Week 2: Customize
- Seed your own data
- Create custom vocabulary lists
- Import Finnish articles
- Practice pronunciation
- Export your progress

### Week 3: Deploy
- Read `PRODUCTION_DEPLOYMENT.md`
- Set up production server
- Configure SSL/HTTPS
- Deploy with Docker
- Run health checks

### Week 4: Launch
- Complete `PRE_LAUNCH_CHECKLIST.md`
- Run `TESTING_GUIDE.md` tests
- Generate PWA screenshots
- Monitor for 24 hours
- Go live! 🚀

---

## 🆘 Troubleshooting

### Backend won't start

```bash
# Check database connection
psql -h localhost -U synapse -d synapse

# Check environment variables
cat backend/.env

# Check logs
docker logs synapse-backend
```

### Frontend won't start

```bash
# Clear node_modules
rm -rf frontend/node_modules
cd frontend && npm install

# Check Node version
node --version  # Should be 18+

# Try different port
cd frontend && npm run dev -- --port 3000
```

### Database connection failed

```bash
# Check PostgreSQL is running
docker ps  # Look for postgres container
# Or
systemctl status postgresql

# Test connection
psql -h localhost -U postgres -c "SELECT 1"

# Check .env file
grep DB_ backend/.env
```

### API keys not working

```bash
# Test Claude API
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_KEY" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-sonnet-20240229","messages":[{"role":"user","content":"Hi"}],"max_tokens":10}'

# Check keys in .env
grep API_KEY backend/.env
```

---

## 💡 Pro Tips

### Performance

```bash
# Build for production (smaller bundle)
cd frontend && npm run build

# Backend with optimizations
cd backend && go build -ldflags="-s -w" cmd/api/main.go
```

### Development

```bash
# Watch mode for Go (install air)
go install github.com/cosmtrek/air@latest
cd backend && air

# Frontend with HMR (already enabled)
cd frontend && npm run dev
```

### Database

```bash
# Connect to database
psql -U synapse -d synapse

# View tables
\dt

# View words
SELECT word, status FROM words LIMIT 10;

# Check user count
SELECT COUNT(*) FROM users;
```

---

## 🎯 Next Steps

1. **Explore the demo data**
   - Login: `demo@synapse.app` / `Demo1234`
   - 22 Finnish words already loaded
   - 4 quests ready to review

2. **Read the documentation**
   - Start with `README.md`
   - Then `FINAL_SESSION_SUMMARY.md`
   - For deployment: `PRODUCTION_DEPLOYMENT.md`

3. **Test the features**
   - Complete a quest
   - Add words to Synapse
   - Import an article
   - Practice speaking
   - Export your data

4. **Customize for yourself**
   - Add your own vocabulary
   - Create quests for your level
   - Import content you care about
   - Set your learning goals

5. **Deploy to production**
   - Follow `PRE_LAUNCH_CHECKLIST.md`
   - Run tests from `TESTING_GUIDE.md`
   - Generate PWA screenshots
   - Launch! 🚀

---

## 📞 Getting Help

- **Documentation**: See `/docs` folder
- **API Docs**: http://localhost:8080/api/docs
- **Health Check**: http://localhost:8080/health
- **GitHub Issues**: https://github.com/BachirKhiati/lexia/issues

---

## 🎉 You're Ready!

Synapse is now running locally. Start exploring, learning, and mastering Finnish!

**Happy Learning! 🧠✨**

---

**Last Updated**: November 7, 2025
**Version**: 1.0.0
**Status**: Production Ready 🚀
