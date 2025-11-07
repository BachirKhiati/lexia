# 🚀 Synapse Quick Start Guide

Get Synapse up and running in 5 minutes!

## Prerequisites Check

Before you begin, ensure you have:
- ✅ Docker & Docker Compose installed
- ✅ API keys for Claude and/or Gemini
- ✅ Text editor (VS Code recommended)

## Step 1: Get the Code

```bash
# If you haven't cloned yet
git clone https://github.com/BachirKhiati/synapse.git
cd synapse
```

## Step 2: Set Up API Keys

```bash
# Copy the environment template
cp .env.example .env

# Edit .env and add your API keys
# You can use nano, vim, or any text editor
nano .env
```

Add your keys:
```bash
CLAUDE_API_KEY=sk-ant-xxxxx
GEMINI_API_KEY=AIzaSyxxxxx
```

## Step 3: Start Everything

```bash
# This will start PostgreSQL, Redis, Backend, and Frontend
docker-compose up
```

Wait for these messages:
```
✅ synapse-postgres   | database system is ready to accept connections
✅ synapse-redis      | Ready to accept connections
✅ synapse-backend    | 🚀 Synapse server starting on :8080
✅ synapse-frontend   | VITE ready in X ms
```

## Step 4: Open Synapse

Open your browser and go to:
**http://localhost:3000**

You should see the Synapse dashboard! 🎉

## What to Try First

### 1. Generate Your First Quest ✍️
- Click on "The Scribe" in the sidebar
- Click "Generate New Quest"
- Follow the AI's instructions
- Click on any word in the quest to see the Analyzer popup!

### 2. Explore The Analyzer 🔍
- Hover over ANY word in the app
- Click it to see:
  - Definition
  - Examples
  - Conjugations
  - Pronunciation
- Try clicking "Add to Synapse" on a word

### 3. View Your Knowledge Graph 🧠
- Click on "The Synapse" in the sidebar
- See your words visualized
- Ghost nodes (dotted) = learning
- Solid nodes (glowing green) = mastered

### 4. Import Real Content 🌍
- Click on "The Lens"
- Paste a URL (try a Finnish news article)
- Click "Import"
- Every word in the article is now clickable!

## Troubleshooting

### Backend not starting?
```bash
# Check if PostgreSQL is ready
docker logs synapse-postgres

# Check backend logs
docker logs synapse-backend
```

### Frontend not loading?
```bash
# Check frontend logs
docker logs synapse-frontend

# Try rebuilding
docker-compose down
docker-compose up --build
```

### API keys not working?
- Make sure you copied `.env.example` to `.env`
- Check that your API keys are valid
- Restart docker-compose after changing `.env`

### Port already in use?
If port 3000, 8080, 5432, or 6379 is already in use:
```bash
# Option 1: Stop other services using these ports
# Option 2: Edit docker-compose.yml to use different ports
```

## Manual Setup (Without Docker)

### Backend
```bash
cd backend

# Install dependencies
go mod download

# Set up .env
cp .env.example .env
# Edit with your values

# Make sure PostgreSQL is running on localhost:5432
# Make sure Redis is running on localhost:6379

# Start backend
go run cmd/api/main.go
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Next Steps

1. **Read the full README**: See `README.md` for detailed documentation
2. **Learn the architecture**: See `docs/ARCHITECTURE.md`
3. **Customize**: Edit the code to add your own features
4. **Share**: Star the repo if you find it useful!

## Common Commands

```bash
# Start everything
docker-compose up

# Start in background
docker-compose up -d

# Stop everything
docker-compose down

# Rebuild after code changes
docker-compose up --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Reset database (⚠️ deletes all data)
docker-compose down -v
docker-compose up
```

## Getting Help

- 📖 Check the main [README.md](README.md)
- 🏗️ See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical details
- 🐛 Report issues on GitHub
- 💬 Ask questions in discussions

---

**Happy Learning! 🧠✨**

Start exploring Finnish (or any language) in a whole new way with Synapse!
