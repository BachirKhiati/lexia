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

### 🗣️ The Orator - Speaking Coach *(Coming Soon)*
Take your learning from text to speech:
- **Pronunciation Practice**: Record yourself and get AI feedback
- **AI Conversations**: Role-play real scenarios in Finnish
- **Speaking Quests**: Practice speaking what you've written
- **Progress Tracking**: See your speaking improve over time

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

## 🔑 API Keys Setup

You'll need API keys from:

1. **Claude API** (Anthropic)
   - Sign up at: https://console.anthropic.com
   - Used for: Quest generation, Socratic feedback

2. **Gemini API** (Google)
   - Sign up at: https://ai.google.dev
   - Used for: Translation, grammar analysis

3. **OpenAI API** (Optional, for Orator module)
   - Sign up at: https://platform.openai.com
   - Used for: Whisper speech-to-text

Add these to your `.env` file:
```bash
CLAUDE_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

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

## 📖 API Endpoints

### Analyzer
- `POST /api/v1/analyze` - Analyze a word (definition, conjugations, examples)

### Quests (The Scribe)
- `GET /api/v1/users/:id/quests` - Get user's quests
- `POST /api/v1/users/:id/quests/generate` - Generate new quest
- `POST /api/v1/users/:id/quests/validate` - Validate quest submission

### Synapse (Knowledge Graph)
- `GET /api/v1/users/:id/synapse` - Get user's mind map
- `POST /api/v1/users/:id/synapse/words` - Add word to Synapse

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
