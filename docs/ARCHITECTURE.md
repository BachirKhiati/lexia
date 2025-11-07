# Synapse Architecture

## System Overview

Synapse follows a clean, modular architecture with clear separation between backend (Go), frontend (React), and data layer (PostgreSQL + Redis).

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Scribe  │  │ Synapse  │  │   Lens   │  │  Orator  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └─────────────┴─────────────┴──────────────┘          │
│                         │                                    │
│                   ┌─────▼─────┐                             │
│                   │  Analyzer │  (Universal)                │
│                   └─────┬─────┘                             │
└─────────────────────────┼─────────────────────────────────┘
                          │ REST API
┌─────────────────────────▼─────────────────────────────────┐
│                    Backend (Go)                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                    Handlers                           │ │
│  │  [Analyzer] [Quest] [Synapse] [Lens] [Orator]       │ │
│  └────────────────┬─────────────────────────────────────┘ │
│                   │                                        │
│  ┌────────────────▼──────────────┬──────────────────────┐ │
│  │      Services                 │                       │ │
│  │  ┌─────────┐  ┌──────────┐  │  ┌────────────────┐  │ │
│  │  │   AI    │  │ Language │  │  │   Database     │  │ │
│  │  │ (Multi) │  │ (Finnish)│  │  │   (Postgres)   │  │ │
│  │  └────┬────┘  └──────────┘  │  └────────────────┘  │ │
│  │       │                      │                       │ │
│  │  ┌────▼────┐  ┌─────────┐  │                       │ │
│  │  │ Claude  │  │ Gemini  │  │                       │ │
│  │  └─────────┘  └─────────┘  │                       │ │
│  └──────────────────────────────┴──────────────────────┘ │
└───────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
   ┌────▼─────┐                      ┌─────▼────┐
   │PostgreSQL│                      │  Redis   │
   │(Primary) │                      │ (Cache)  │
   └──────────┘                      └──────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App
├── Layout (Navigation + Stats)
├── Dashboard (Home page)
└── Pages
    ├── ScribePage (Quest workbench)
    │   └── QuestCard
    │       └── HoverableText → WordAnalyzer
    ├── SynapsePage (Mind map)
    │   └── MindMap (D3.js visualization)
    ├── LensPage (Content importer)
    │   └── HoverableText → WordAnalyzer
    └── OratorPage (Speaking coach)
```

### State Management

- **React Query**: Server state (API data, caching)
- **React Hooks**: Local component state
- **Context** (future): User authentication

### Key Design Patterns

1. **HoverableText Component**: Universal wrapper that makes any text explorable
2. **WordAnalyzer Popup**: Portal-based modal for word analysis
3. **API Service Layer**: Centralized API calls with axios

## Backend Architecture

### Package Structure

```
backend/
├── cmd/api/              # Application entry point
├── internal/             # Private application code
│   ├── config/          # Configuration loader
│   ├── database/        # Database connection & schema
│   ├── handlers/        # HTTP handlers (controllers)
│   │   ├── analyzer.go
│   │   ├── quest.go
│   │   └── synapse.go
│   ├── models/          # Data structures
│   ├── services/        # Business logic
│   │   ├── ai/         # AI provider abstraction
│   │   │   ├── provider.go  (interface)
│   │   │   ├── claude.go    (implementation)
│   │   │   └── gemini.go    (implementation)
│   │   ├── language/   # Finnish language tools
│   │   └── speech/     # Speech processing (future)
│   └── middleware/      # HTTP middleware
└── pkg/                 # Public utilities
```

### Clean Architecture Layers

1. **Handlers**: HTTP request/response handling
2. **Services**: Business logic (AI, language processing)
3. **Models**: Data structures and types
4. **Database**: Data persistence

### AI Service Design

The AI service uses a **multi-provider pattern** with a common interface:

```go
type AIProvider interface {
    GenerateQuest(...)
    ValidateQuestSubmission(...)
    GenerateSocraticFeedback(...)
    Translate(...)
    AnalyzeGrammar(...)
}
```

**Benefits:**
- Easy to add new AI providers
- Fallback support (if Claude fails, use Gemini)
- Provider-specific optimizations (use Gemini for cheap translations)

## Database Schema

### Core Tables

```sql
users
├── id (PK)
├── email
├── username
├── language (target language)
└── timestamps

quests
├── id (PK)
├── user_id (FK)
├── title
├── description
├── solution (glimpse)
├── difficulty
├── status (pending, in_progress, completed)
└── timestamps

words (nodes in knowledge graph)
├── id (PK)
├── user_id (FK)
├── word
├── lemma (root form)
├── language
├── definition
├── part_of_speech
├── examples (array)
├── status (ghost, solid)
└── timestamps

word_conjugations
├── id (PK)
├── word_id (FK)
├── tense
├── person
├── form
└── language

word_relations (edges in knowledge graph)
├── id (PK)
├── user_id (FK)
├── source_word_id (FK)
├── target_word_id (FK)
├── relation_type
└── created_at
```

### Indexing Strategy

- Index on `user_id` for all user-specific queries
- Index on `status` for filtering (quests, words)
- Composite index on `(user_id, status)` for common queries

## Data Flow Examples

### 1. Word Analysis Flow

```
User hovers word "kirjoitan"
    ↓
WordAnalyzer component
    ↓
POST /api/v1/analyze {word: "kirjoitan", language: "finnish"}
    ↓
AnalyzerHandler
    ↓
LanguageService.AnalyzeWord()
    ↓
Returns: {
    word: "kirjoitan",
    lemma: "kirjoittaa",
    definition: "to write",
    part_of_speech: "verb",
    examples: [...],
    conjugations: [...]
}
    ↓
Display in WordAnalyzer popup
    ↓
User clicks "Add to Synapse"
    ↓
POST /api/v1/users/1/synapse/words
    ↓
Insert into 'words' table with status='ghost'
```

### 2. Quest Completion Flow

```
User submits quest answer
    ↓
POST /api/v1/users/1/quests/validate {quest_id: 5, user_text: "..."}
    ↓
QuestHandler.ValidateQuest()
    ↓
Fetch quest from database
    ↓
AIService.ValidateQuestSubmission() → Claude API
    ↓
Claude returns: {is_valid: true, feedback: "..."}
    ↓
Update quest status to 'completed'
    ↓
Mark words as 'solid' in user's Synapse
    ↓
Return validation response
    ↓
Frontend shows success animation
```

### 3. Mind Map Rendering Flow

```
User navigates to Synapse page
    ↓
GET /api/v1/users/1/synapse
    ↓
SynapseHandler.GetMindMap()
    ↓
Query words + relations from database
    ↓
Return: {
    nodes: [{id, word, status, category}, ...],
    links: [{source, target, relation_type}, ...]
}
    ↓
MindMap component (D3.js)
    ↓
Create force-directed graph
    ↓
Render nodes (ghost = dotted, solid = glowing)
    ↓
Render edges (connections)
    ↓
Enable drag & click interactions
```

## Security Considerations

### Current Implementation
- CORS protection
- SQL injection prevention (parameterized queries)
- Input validation

### TODO (Production)
- JWT authentication
- Rate limiting
- API key rotation
- HTTPS only
- Content Security Policy
- SQL injection testing

## Performance Optimizations

### Backend
- **Redis caching**: Common word analyses, conjugations
- **Database connection pooling**: Reuse connections
- **Concurrent AI requests**: Use Go goroutines

### Frontend
- **React Query caching**: Reduce API calls
- **D3.js optimization**: Limit node count, use canvas for large graphs
- **Code splitting**: Lazy load routes
- **Image optimization**: Compress and lazy load

## Scalability Plan

### Phase 1 (Current): Single Server
- Dockerized services
- PostgreSQL + Redis
- Works for 1-10k users

### Phase 2: Horizontal Scaling
- Load balancer (Nginx)
- Multiple Go backend instances
- Shared PostgreSQL (read replicas)
- Redis cluster

### Phase 3: Microservices
- Separate services:
  - Auth service
  - Quest service
  - Synapse service
  - AI service (with queue)
- Message queue (RabbitMQ/Kafka)
- CDN for frontend

## Monitoring & Logging

### Current
- Go standard logging
- HTTP request logging (Chi middleware)

### Production TODO
- Structured logging (Zap, Zerolog)
- Metrics (Prometheus)
- Tracing (OpenTelemetry)
- Error tracking (Sentry)
- Performance monitoring (New Relic, DataDog)

## Testing Strategy

### Backend
- Unit tests for services
- Integration tests for handlers
- Mock AI providers for testing

### Frontend
- Component tests (React Testing Library)
- E2E tests (Playwright, Cypress)

## Deployment

### Development
```bash
docker-compose up
```

### Production (Future)
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Backend**: Railway, Render, or AWS ECS
- **Database**: Managed PostgreSQL (AWS RDS, Supabase)
- **Redis**: Managed Redis (AWS ElastiCache, Upstash)

---

This architecture is designed to be:
- **Modular**: Easy to add new modules
- **Scalable**: Can grow with user base
- **Maintainable**: Clear separation of concerns
- **Extensible**: Easy to add new languages or AI providers
