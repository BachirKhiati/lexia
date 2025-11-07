# Synapse Changelog

## [Unreleased] - 2025-01-XX

### ✅ Major Features Completed (Latest)

#### 3. Finnish Verb Conjugation Engine
**Status: COMPLETE** ✅

- Complete 6-type Finnish verb system
- Present, past, and conditional tenses
- All 6 persons (1sg, 2sg, 3sg, 1pl, 2pl, 3pl)
- Vowel harmony rules
- Automatic verb type detection
- Stem extraction algorithms
- Real conjugations in Analyzer pop-up
- Unit tests for all verb types

**Verb Types Supported:**
- Type 1: -A/Ä (sanoa, puhua)
- Type 2: -DA (syödä, juoda)
- Type 3: -LA/-NA/-RA/-STA (tulla, mennä)
- Type 4: -ATA/-ÄTÄ (haluta, pelätä)
- Type 5: -ITA/-ITÄ (tarvita)
- Type 6: -ETA/-ETÄ (vanheta)

#### 4. Web Speech API (The Orator)
**Status: COMPLETE** ✅

Complete speaking practice module with:

**Pronunciation Practice:**
- Speech recognition (Finnish + other languages)
- Text-to-speech for native pronunciation
- Levenshtein distance scoring
- 100-point scoring system
- Visual feedback (green/yellow/red)
- Common verb practice

**Conversation Mode:**
- Real-time AI conversations
- Speech-to-text input
- Voice responses
- Message history
- Topic-based practice

**Custom Hooks:**
- useSpeechRecognition
- useSpeechSynthesis
- Browser compatibility checks
- Error handling

#### 5. Real-time Progress Tracking
**Status: COMPLETE** ✅

Dynamic sidebar statistics from actual database:

**Backend:**
- User progress endpoint: `GET /api/v1/users/progress`
- Auto-calculation from words and quests tables
- user_progress table integration
- Real-time stat updates

**Frontend:**
- Live progress fetching on mount
- Words mastered count (status='solid')
- Quests completed count (status='completed')
- Streak days tracking
- Loading states with fallbacks

**Features:**
- No more hardcoded stats
- Real database queries
- Automatic progress initialization
- User-specific progress tracking

#### 6. Wiktionary API Integration
**Status: COMPLETE** ✅

Real word definitions from Wiktionary instead of placeholders:

**Backend:**
- Created wiktionary service with MediaWiki REST API
- Language-specific endpoints (fi.wiktionary.org for Finnish)
- Graceful fallback to placeholder on API failure
- Extracts: definition, part of speech, examples
- 10-second timeout for reliability

**Integration:**
- Language service now uses Wiktionary for real definitions
- Auto-detection of best definition
- Combines Wiktionary data with Finnish conjugations
- Logging for successful/failed lookups

**Features:**
- Real Finnish word definitions
- Accurate part-of-speech detection
- Native example sentences
- No API keys required (free service)
- Fallback ensures app never breaks

#### 7. Spaced Repetition System (SRS)
**Status: COMPLETE (Backend)** ✅

Intelligent review scheduling using SM-2 algorithm:

**Backend:**
- SM-2 algorithm implementation (services/srs/sm2.go)
- Quality ratings 0-5 (blackout to perfect recall)
- Dynamic ease factor adjustment (minimum 1.3)
- Intelligent interval calculation:
  - First review: 1 day
  - Second review: 6 days
  - Subsequent: interval × ease_factor
- Database schema with SRS fields:
  - ease_factor, repetition_count, interval
  - next_review_at, last_reviewed_at

**API Endpoints:**
- `GET /api/v1/srs/due` - Get words due for review
- `POST /api/v1/srs/review` - Submit review with quality rating

**Features:**
- Adaptive learning based on performance
- Automatic scheduling of next reviews
- Optimizes long-term retention
- Tracks mastery progression
- Ready for frontend integration

**Next:** Frontend review mode UI (The Scribe integration)

#### 1. User Authentication System (JWT-based)
**Status: COMPLETE** ✅

- Full JWT authentication with bcrypt password hashing
- Login and registration pages with beautiful UI
- Protected routes with automatic redirects
- Token refresh mechanism
- Auth context for global state management
- Automatic token injection in API requests
- 401 error handling with auto-logout
- User info display in sidebar
- Multi-language selection on registration

**Endpoints Added:**
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Get JWT token
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh token

**Security:**
- Bcrypt password hashing (cost 10)
- HMAC-SHA256 signed JWTs
- 24-hour token expiration
- Email uniqueness enforcement
- 8-character minimum password

#### 2. Article Extraction API (The Lens)
**Status: COMPLETE** ✅

- Real web scraping with goquery
- Smart content extraction (4 strategies)
- Title extraction
- Paragraph preservation
- Clean text formatting
- Article storage in database
- Every word becomes hoverable/analyzable

**Features:**
- Extract from news sites, blogs, Wikipedia
- Multiple extraction strategies
- Automatic cleanup (removes nav, footer, ads)
- 30-second timeout protection
- User-specific article library

**Endpoints Added:**
- `POST /api/v1/lens/import` - Import article
- `GET /api/v1/lens/articles` - Get user's articles

**Supported Sites:**
- News sites (NYT, BBC, CNN, etc.)
- Blogs and Medium
- Wikipedia
- Documentation sites
- Most HTML5 semantic sites

### 🚧 Features In Progress

#### Frontend Review Mode UI
**Status: PLANNED** 🎯

Complete the SRS frontend integration:
- Review mode in The Scribe
- Word flashcard UI with quality buttons (0-5)
- Review progress display
- Next review countdown
- Daily review stats
- Integration with Synapse visualization

### 🐛 Known Issues

1. **YouTube Transcripts Not Supported** - The Lens doesn't extract video transcripts yet
   - TODO: Integrate YouTube Transcript API

2. **No Email Verification** - Users can register without email confirmation
   - TODO: Add email verification flow

3. **No Password Reset** - Users cannot reset forgotten passwords
   - TODO: Add password reset flow

### 📊 Current Project Status

**Overall Progress: 90% Complete**

**Completed:**
- ✅ Core Architecture (Backend + Frontend)
- ✅ The Scribe (Quest system)
- ✅ The Analyzer (Word pop-up)
- ✅ The Synapse (Mind map visualization)
- ✅ The Lens (Article import)
- ✅ The Orator (Speech module)
- ✅ User Authentication
- ✅ Finnish Conjugation Engine
- ✅ Real-time Progress Tracking
- ✅ Wiktionary Integration
- ✅ Spaced Repetition (Backend)
- ✅ Multi-AI Provider (Claude + Gemini)
- ✅ Docker Setup

**Remaining:**
- 🔨 SRS Frontend UI
- 🔨 Email verification
- 🔨 Password reset

### 🎯 Next Steps

**Priority 1: Finnish Language Tools**
- Implement proper verb conjugation
- Add Wiktionary definitions
- Enhance Analyzer accuracy

**Priority 2: The Orator**
- Web Speech API integration
- Pronunciation scoring
- Speaking quests

**Priority 3: Polish & UX**
- Real progress stats
- Email verification
- Password reset
- Tutorial/onboarding flow

### 💡 Future Enhancements

1. **Mobile App** - React Native version
2. **More Languages** - Spanish, French, German support
3. **Social Features** - Friend system, shared quests
4. **Achievements** - Gamification badges
5. **Audio Lessons** - Listening comprehension
6. **Grammar Explanations** - Interactive grammar guide
7. **Export Progress** - Download learning data
8. **API Access** - Public API for developers

## [0.2.0] - Current Version

### Added
- JWT authentication system
- Login and registration pages
- Article extraction API
- Web scraping service
- Protected routes
- Auth middleware
- Token management
- User context

### Changed
- Removed hardcoded userId
- All endpoints now require authentication
- Frontend uses real auth tokens
- Sidebar shows user info

### Fixed
- Security: Proper authentication
- Multi-user support
- The Lens now extracts real articles

## [0.1.0] - Initial Release

### Added
- Complete 5-module architecture
- The Scribe (Quest workbench)
- The Analyzer (Universal pop-up)
- The Synapse (D3.js mind map)
- The Lens (Placeholder)
- The Orator (Placeholder)
- Claude + Gemini AI integration
- PostgreSQL database schema
- Docker Compose setup
- Comprehensive documentation

---

**Legend:**
- ✅ Complete
- 🔨 In Progress
- 🎤 Planned
- 📚 Research Phase
- 🐛 Bug/Issue
