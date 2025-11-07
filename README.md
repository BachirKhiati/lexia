# 🧠 Synapse

**Your Interactive Language Universe. Don't just learn—explore.**

Synapse is an AI-powered language learning workbench that transforms passive learning into active creation. Built for learners who want to truly master a language through exploration, not memorization.

## 🌟 Core Concept

Synapse creates a complete learning ecosystem where **every piece of text is alive**—hoverable, explorable, and connected to your personal knowledge graph. Learn through a natural cycle:

**Quest → Create → Glimpse → Analyze → Master**

## 🎯 The 5 Modules

### ✍️ The Scribe - Your Guided Workbench
Your main workspace for writing practice:
- **AI Quest Log**: Receive personalized, AI-generated writing challenges
- **Interactive Editor**: Every word you write is instantly analyzable
- **Glimpse Solution**: Get example solutions when stuck
- **Socratic Feedback**: AI guides you without giving direct answers

### 🧠 The Synapse - Your Knowledge Map
A beautiful D3.js mind map visualizing your learning:
- **Ghost Nodes**: Words you've discovered but haven't mastered (dotted outline)
- **Solid Nodes**: Words you've successfully used in quests (glowing green)
- **Connections**: See how concepts relate (grammar, tense, vocabulary)
- **Visual Progress**: Watch your language network grow in real-time

### 🔍 The Analyzer - Universal Pop-up
The magic that makes everything explorable:
- **Hover on ANY word** in any module to see:
  - Definition and root form (lemma)
  - Example sentences
  - Full conjugation table (critical for Finnish!)
  - Pronunciation audio
  - One-click "Add to Synapse"
- Works on quests, solutions, imported articles, and your own writing

### 🌍 The Lens - Real-World Content Importer
Turn the internet into your textbook:
- **Import any URL**: Articles, blogs, YouTube videos
- **Instant Interactivity**: Every word becomes analyzable
- **Discover & Learn**: Find new words, add to Synapse, get quests for them
- **Authentic Content**: Learn from real Finnish content, not textbooks

### 🗣️ The Orator - Speaking Coach ✅
Take your learning from text to speech:
- **Pronunciation Practice**: Record yourself and get scored (Levenshtein distance)
- **AI Conversations**: Real-time conversations with speech recognition
- **Web Speech API**: Browser-based speech-to-text and text-to-speech
- **Finnish Voice**: Native pronunciation with adjustable speed
- **Progress Tracking**: See your speaking improve over time

## ✨ Key Features

### 🎯 Learning System
- ✅ **Spaced Repetition System (SRS)**: SM-2 algorithm for optimal review scheduling
- ✅ **Finnish Verb Conjugation**: Complete 6-type system with vowel harmony
- ✅ **Real Word Definitions**: Wiktionary API integration for authentic Finnish
- ✅ **Progress Tracking**: Real-time statistics on words mastered, quests completed
- ✅ **Multi-AI Support**: Claude and Gemini for diverse AI capabilities

### 🔐 Authentication & Security
- ✅ **JWT Authentication**: Secure token-based auth with bcrypt
- ✅ **Protected Routes**: Automatic redirects for unauthenticated users
- ✅ **User Profiles**: Personalized learning experience per user

### 🎤 Speech Features
- ✅ **Pronunciation Practice**: Browser-based speech recognition
- ✅ **AI Conversations**: Real-time voice chat with AI
- ✅ **Pronunciation Scoring**: Levenshtein distance algorithm
- ✅ **No API Keys Needed**: Uses Web Speech API

### 🚀 Production Ready
- ✅ **Docker Deployment**: Complete production configuration
- ✅ **Health Checks**: Automated monitoring and alerting
- ✅ **SSL/HTTPS**: Let's Encrypt integration
- ✅ **Backup Strategy**: Automated database backups
- ✅ **Monitoring**: Log aggregation and performance metrics
- ✅ **PWA Support**: Progressive Web App with offline functionality
- ✅ **Mobile Optimized**: Responsive design with touch gestures
- ✅ **Service Worker**: Caching and offline mode
- ✅ **Install Prompt**: Add to home screen on mobile devices

## 🚀 Tech Stack

### Backend
- **Go (Golang)**: Fast, concurrent API server
- **PostgreSQL**: Primary database for users, quests, words
- **Redis**: Caching for performance
- **Chi Router**: Lightweight HTTP router

### Frontend
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Beautiful, responsive design
- **D3.js**: Interactive mind map visualization
- **Vite**: Lightning-fast build tool
- **React Query**: Smart data fetching and caching

### AI Services
- **Claude API** (Anthropic): Socratic teaching, quest generation, nuanced feedback
- **Gemini API** (Google): Translation, grammar analysis, cost-effective operations
- **OpenAI Whisper**: Speech-to-text for pronunciation practice

## 📦 Installation

### Prerequisites
- **Go 1.21+**
- **Node.js 20+**
- **Docker & Docker Compose** (recommended)
- **PostgreSQL 15+** (if not using Docker)
- **Redis 7+** (if not using Docker)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/BachirKhiati/synapse.git
   cd synapse
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Start all services**
   ```bash
   docker-compose up
   ```

4. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - API Documentation (Swagger UI): http://localhost:8080/api/docs
   - Health check: http://localhost:8080/health

That's it! 🎉

### Manual Setup (Without Docker)

#### Backend Setup

```bash
cd backend

# Install Go dependencies
go mod download

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations (make sure PostgreSQL is running)
# psql -U postgres -c "CREATE DATABASE synapse_db;"

# Start the server
go run cmd/api/main.go
```

Backend will start on `http://localhost:8080`

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start on `http://localhost:3000`

## 🚀 Production Deployment

Synapse is **production-ready** with complete deployment infrastructure!

### Quick Deploy

```bash
# 1. Configure production environment
cp backend/.env.production.example backend/.env.production
# Edit backend/.env.production with your secrets

# 2. Deploy with Docker
docker compose -f docker-compose.prod.yml up -d

# 3. Set up SSL (Let's Encrypt)
sudo certbot --nginx -d yourdomain.com

# 4. Configure monitoring and backups
# See DEPLOYMENT.md for complete guide
```

### 📚 Deployment Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete production deployment guide
  - Prerequisites and server setup
  - Environment configuration
  - Database setup and migrations
  - Nginx + SSL/HTTPS configuration
  - Security checklist
  - Backup and restore procedures
  - Troubleshooting

- **[DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md)** - Database migration guide
  - Schema documentation
  - Migration strategies
  - Rollback procedures
  - Best practices

- **[MONITORING.md](MONITORING.md)** - Monitoring and logging setup
  - Health checks
  - Log aggregation
  - Alerting (Email/Slack/PagerDuty)
  - Performance metrics
  - Error tracking with Sentry

### Features

✅ Production-ready Docker configuration
✅ Automated health checks
✅ SSL/HTTPS with Let's Encrypt
✅ Log rotation and management
✅ Automated backups
✅ Monitoring and alerting
✅ Security best practices
✅ Zero-downtime updates

## 🔑 API Keys Setup

You'll need API keys from:

1. **Claude API** (Anthropic) - **Required**
   - Sign up at: https://console.anthropic.com
   - Used for: Quest generation, Socratic feedback, word analysis

2. **Gemini API** (Google) - **Required**
   - Sign up at: https://ai.google.dev
   - Used for: Translation, grammar analysis, alternative AI provider

Add these to your `.env` file:
```bash
CLAUDE_API_KEY=sk-ant-your-key-here
GEMINI_API_KEY=AIza-your-key-here
DEFAULT_AI_PROVIDER=claude
```

**Note:** The Orator (speaking coach) uses the **Web Speech API** built into modern browsers, so no additional API keys are needed for speech features!

## 🗂️ Project Structure

```
synapse/
├── backend/                # Go backend
│   ├── cmd/
│   │   └── api/           # Main application entry
│   ├── internal/
│   │   ├── config/        # Configuration management
│   │   ├── database/      # PostgreSQL setup and schema
│   │   ├── handlers/      # HTTP request handlers
│   │   ├── models/        # Data models
│   │   ├── services/
│   │   │   ├── ai/        # Claude & Gemini providers
│   │   │   ├── language/  # Finnish language tools
│   │   │   └── speech/    # Speech processing (future)
│   │   └── middleware/    # HTTP middleware
│   └── go.mod
│
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Analyzer/  # Universal word analyzer
│   │   │   ├── Scribe/    # Quest workbench
│   │   │   ├── Synapse/   # D3.js mind map
│   │   │   ├── Lens/      # Content importer
│   │   │   └── Orator/    # Speaking coach
│   │   ├── pages/         # Main application pages
│   │   ├── services/      # API client
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # Global styles
│   └── package.json
│
├── docker-compose.yml     # Docker orchestration
├── .env.example          # Environment template
└── README.md            # This file
```

## 📖 API Documentation

### Interactive API Documentation (Swagger UI)

**Swagger UI**: `http://localhost:8080/api/docs`

The API includes interactive Swagger/OpenAPI documentation with:
- 📚 Complete API reference with request/response schemas
- 🧪 Try-it-out functionality to test endpoints
- 🔐 Built-in authentication support
- 📝 Detailed descriptions and examples

**To regenerate Swagger docs after making changes:**
```bash
cd backend
./generate-swagger.sh
# OR manually:
swag init -g cmd/api/main.go -o docs --parseDependency --parseInternal
```

For detailed API usage examples and code samples, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user info
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Analyzer
- `POST /api/v1/analyze` - Analyze a word (definition, conjugations, examples)

### Quests (The Scribe)
- `GET /api/v1/users/:id/quests` - Get user's quests
- `POST /api/v1/users/:id/quests/generate` - Generate new quest
- `POST /api/v1/users/:id/quests/validate` - Validate quest submission

### Synapse (Knowledge Graph)
- `GET /api/v1/users/:id/synapse` - Get user's mind map
- `POST /api/v1/users/:id/synapse/words` - Add word to Synapse

### The Lens (Content Importer)
- `POST /api/v1/lens/import` - Import article from URL
- `GET /api/v1/lens/articles` - Get user's imported articles

### User Progress
- `GET /api/v1/users/progress` - Get user's learning statistics

### Spaced Repetition System (SRS)
- `GET /api/v1/srs/due` - Get words due for review
- `POST /api/v1/srs/review` - Submit review with quality rating (0-5)

## 🎨 Design Philosophy

### 1. **Text is Alive**
Every word, everywhere in the app, is clickable and explorable. No more static text.

### 2. **Learning by Doing**
You don't memorize vocabulary lists—you use words in real sentences and get instant feedback.

### 3. **Visual Progress**
Your knowledge graph grows visually. Ghost nodes become solid. Connections multiply. You SEE your progress.

### 4. **Socratic Guidance**
The AI doesn't just correct you—it asks questions, guides you, and makes you think.

### 5. **Real Content**
Learn from actual Finnish articles, not textbook exercises. The Lens makes the entire internet your classroom.

## 🌍 Currently Supported Languages

- **Finnish** (primary focus)
- Easily extensible to other languages

## 🤝 Contributing

Contributions are welcome! This is a learning project, and we'd love your help:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - feel free to use this project for learning or building your own language apps!

## 🙏 Acknowledgments

- Built with Claude's assistance
- Inspired by modern language learning apps and the need for more interactive tools
- Special focus on Finnish language learning

## 🐛 Known Issues & Roadmap

### Current Limitations
- [ ] User authentication not yet implemented (using hardcoded userId: 1)
- [ ] The Orator module is a placeholder (speech features coming soon)
- [ ] The Lens needs real article extraction API
- [ ] Finnish conjugation engine needs proper linguistic library

### Upcoming Features
- [ ] User authentication (JWT)
- [ ] Finnish verb conjugation engine
- [ ] Wiktionary API integration
- [ ] Forvo API for native pronunciation
- [ ] Spaced repetition system
- [ ] Mobile app (React Native)
- [ ] More languages support

---

**Made with ❤️ for language learners who want to truly explore, not just memorize.**

🧠 **Start your journey. Build your Synapse.**
