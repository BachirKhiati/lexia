# Synapse Changelog

## [Unreleased] - 2025-01-XX

### ✅ Major Features Completed

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

#### 3. Finnish Verb Conjugation Engine
**Status: PLANNED** 🔨

Finnish has complex verb conjugation with:
- 6 verb types
- 15+ tenses/moods
- Consonant gradation
- Vowel harmony

**Plan:**
- Create comprehensive conjugation rules
- Build verb type classifier
- Implement gradation logic
- Add to Analyzer pop-up
- Show full conjugation tables

#### 4. Web Speech API (The Orator)
**Status: PLANNED** 🎤

Enable speaking practice with:
- Browser Speech Recognition API
- Pronunciation scoring
- Real-time feedback
- Role-play conversations
- Progress tracking

**Features:**
- Record user speech
- Compare to native pronunciation
- AI-powered feedback
- Speaking quests based on written quests
- Conversation mode

#### 5. Wiktionary API Integration
**Status: PLANNED** 📚

Replace placeholder word definitions:
- Real Finnish definitions
- Etymology information
- IPA pronunciation
- Usage notes
- Related words
- Proper conjugation data

**Benefits:**
- Accurate definitions
- Native speaker quality
- Free API (no cost)
- Multilingual support

#### 6. Spaced Repetition System
**Status: PLANNED** 🔄

Implement SRS for optimal retention:
- SM-2 or similar algorithm
- Review scheduling
- Difficulty adjustments
- Progress tracking
- "Review" mode in Scribe

**Features:**
- Track word mastery level
- Schedule optimal reviews
- Adapt to user performance
- Integrate with quests

### 🐛 Known Issues

1. **Hardcoded Progress Stats** - Sidebar shows static numbers (24 words, 12 quests)
   - TODO: Query real data from user_progress table

2. **No Real Finnish Conjugation** - Placeholder conjugations
   - TODO: Implement proper Finnish morphology

3. **YouTube Transcripts Not Supported** - The Lens doesn't extract video transcripts yet
   - TODO: Integrate YouTube Transcript API

4. **No Email Verification** - Users can register without email confirmation
   - TODO: Add email verification flow

5. **No Password Reset** - Users cannot reset forgotten passwords
   - TODO: Add password reset flow

### 📊 Current Project Status

**Overall Progress: 70% Complete**

**Completed:**
- ✅ Core Architecture (Backend + Frontend)
- ✅ The Scribe (Quest system)
- ✅ The Analyzer (Word pop-up)
- ✅ The Synapse (Mind map visualization)
- ✅ The Lens (Article import)
- ✅ User Authentication
- ✅ Multi-AI Provider (Claude + Gemini)
- ✅ Docker Setup

**Remaining:**
- 🔨 The Orator (Speech module)
- 🔨 Finnish Conjugation Engine
- 🔨 Wiktionary Integration
- 🔨 Spaced Repetition
- 🔨 Real-time progress tracking
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
