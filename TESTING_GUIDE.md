# Synapse Testing Guide & Pre-Launch Checklist

**Last Updated**: November 7, 2025
**Status**: Production Ready - Final Testing Phase

---

## 📋 Table of Contents

1. [Quick Start Testing](#quick-start-testing)
2. [Functional Testing](#functional-testing)
3. [Cross-Browser Testing](#cross-browser-testing)
4. [Mobile Testing](#mobile-testing)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)
7. [Accessibility Testing](#accessibility-testing)
8. [Pre-Launch Checklist](#pre-launch-checklist)
9. [Testing Scripts](#testing-scripts)

---

## 🚀 Quick Start Testing

### 1. Setup Test Environment

```bash
# Clone and setup
git clone https://github.com/BachirKhiati/lexia.git
cd lexia

# Seed database with demo data
./seed-database.sh

# Start backend
cd backend
go run cmd/api/main.go

# Start frontend (new terminal)
cd frontend
npm install
npm run dev
```

### 2. Quick Smoke Test (5 minutes)

Visit `http://localhost:5173` and verify:
- [ ] Login page loads
- [ ] Can register new account
- [ ] Can login with demo account (`demo@synapse.app` / `Demo1234`)
- [ ] Dashboard displays
- [ ] Onboarding tour appears (first time)
- [ ] Navigation works (all menu items)
- [ ] Can logout

---

## 🧪 Functional Testing

### Authentication & User Management

**Test Cases:**

1. **Registration**
   - [ ] Register with valid email/password
   - [ ] Error on duplicate email
   - [ ] Password validation (min 8 chars, uppercase, lowercase, number)
   - [ ] Username validation (min 3 chars, alphanumeric)
   - [ ] Language selection works
   - [ ] Auto-login after registration
   - [ ] Onboarding tour appears for new users

2. **Login**
   - [ ] Login with valid credentials
   - [ ] Error on invalid email
   - [ ] Error on invalid password
   - [ ] Error messages are user-friendly
   - [ ] "Remember me" persists session
   - [ ] Redirect to dashboard after login

3. **Logout**
   - [ ] Logout clears session
   - [ ] Redirect to login page
   - [ ] Cannot access protected routes after logout
   - [ ] Token removed from localStorage

### The Analyzer

**Test Cases:**

1. **Word Analysis**
   - [ ] Analyze Finnish word returns definition
   - [ ] Part of speech displayed
   - [ ] Examples shown (if available)
   - [ ] Conjugation tables displayed
   - [ ] Can add word to vocabulary
   - [ ] Error handling for unknown words
   - [ ] Loading state displays

2. **Word Addition**
   - [ ] Word added as "ghost" status
   - [ ] Appears in Synapse mind map
   - [ ] Appears in word list
   - [ ] Duplicate detection works

### The Scribe (Quests)

**Test Cases:**

1. **Quest Generation**
   - [ ] Generate quest with ghost words
   - [ ] Quest title and description displayed
   - [ ] Target words highlighted
   - [ ] AI generation works (Claude/Gemini)
   - [ ] Loading state during generation
   - [ ] Error handling if API fails

2. **Quest Completion**
   - [ ] Submit quest response
   - [ ] Validation feedback displayed
   - [ ] Quest marked as completed
   - [ ] Ghost words promoted to liquid/solid
   - [ ] Progress updated

3. **Quest List**
   - [ ] View all quests
   - [ ] Filter by status (pending, in_progress, completed)
   - [ ] Quest cards display correctly
   - [ ] Click to view details

### The Synapse (Mind Map)

**Test Cases:**

1. **Visualization**
   - [ ] Mind map displays all words
   - [ ] Ghost nodes (gray/transparent)
   - [ ] Liquid nodes (yellow/orange)
   - [ ] Solid nodes (green)
   - [ ] Nodes are interactive
   - [ ] Zoom and pan work

2. **Word Management**
   - [ ] Click node shows word details
   - [ ] Can delete word
   - [ ] Word status updates reflected
   - [ ] Network layout updates

### The Lens (Content Import)

**Test Cases:**

1. **URL Import**
   - [ ] Paste article URL
   - [ ] Content extracted correctly
   - [ ] Title and summary displayed
   - [ ] Words extracted
   - [ ] Words added to vocabulary

2. **Text Import**
   - [ ] Paste raw text
   - [ ] Text analyzed
   - [ ] Words extracted
   - [ ] Can select words to add

### The Orator (Speaking)

**Test Cases:**

1. **Speech Recognition**
   - [ ] Microphone permission requested
   - [ ] Recording starts on click
   - [ ] Speech transcribed
   - [ ] Feedback provided
   - [ ] Pronunciation tips shown

2. **Conversation**
   - [ ] AI responds to speech
   - [ ] Context maintained
   - [ ] Natural flow
   - [ ] Can end conversation

### Spaced Repetition System (SRS)

**Test Cases:**

1. **Review Flow**
   - [ ] Due words displayed
   - [ ] Review interface works
   - [ ] Quality rating (1-5) updates SRS
   - [ ] Next review date calculated
   - [ ] Ease factor adjusted
   - [ ] Interval days updated

2. **SRS Algorithm**
   - [ ] Good rating increases interval
   - [ ] Poor rating resets interval
   - [ ] Ease factor bounds (1.3-2.5)
   - [ ] No reviews when none due

### Analytics Dashboard

**Test Cases:**

1. **Statistics Display**
   - [ ] Total words count
   - [ ] Words mastered count
   - [ ] Ghost/Liquid/Solid breakdown
   - [ ] Quests completed/pending
   - [ ] Current streak days
   - [ ] Words due today
   - [ ] Average ease factor

2. **Charts & Graphs**
   - [ ] Words over time chart
   - [ ] Quests over time chart
   - [ ] Part of speech distribution
   - [ ] Challenging words list
   - [ ] Period selector (7/30/90 days)
   - [ ] Charts update on period change

3. **Loading States**
   - [ ] Beautiful skeleton screens display
   - [ ] No flash of empty state
   - [ ] Smooth transition to data

### Export/Import

**Test Cases:**

1. **Export**
   - [ ] Export as JSON downloads file
   - [ ] JSON contains all data (words, quests, progress)
   - [ ] Export as CSV downloads file
   - [ ] CSV contains vocabulary
   - [ ] Files named with timestamp
   - [ ] File format valid

2. **Import**
   - [ ] Import CSV adds words
   - [ ] Duplicate words skipped
   - [ ] Import results displayed
   - [ ] Error handling for invalid CSV
   - [ ] Import JSON restores data
   - [ ] JSON import preserves SRS data
   - [ ] Import results show counts

### User Onboarding

**Test Cases:**

1. **First-Time Experience**
   - [ ] Tour auto-shows after 1 second
   - [ ] All 8 steps display
   - [ ] Progress indicators work
   - [ ] Next/Previous navigation
   - [ ] Quick action buttons work
   - [ ] Can skip tour
   - [ ] Completion stored in localStorage

2. **Tour Restart**
   - [ ] "Take Tour" button on dashboard
   - [ ] Tour displays when clicked
   - [ ] Can restart anytime
   - [ ] Tour closes properly

---

## 🌐 Cross-Browser Testing

### Browsers to Test

1. **Chrome/Chromium** (Priority: High)
   - [ ] Latest version (120+)
   - [ ] Previous version
   - [ ] Incognito mode

2. **Firefox** (Priority: High)
   - [ ] Latest version (120+)
   - [ ] Previous version
   - [ ] Private browsing

3. **Safari** (Priority: High - if on Mac)
   - [ ] Latest version (17+)
   - [ ] Previous version
   - [ ] Private browsing

4. **Edge** (Priority: Medium)
   - [ ] Latest version (120+)

### What to Test Per Browser

For each browser:
- [ ] Login/logout works
- [ ] All pages load correctly
- [ ] Navigation functional
- [ ] Forms work (register, login, quest submission)
- [ ] Charts render (Analytics)
- [ ] Mind map renders (Synapse)
- [ ] File upload/download (Export/Import)
- [ ] PWA install prompt (Chrome/Edge only)
- [ ] Responsive design (resize window)
- [ ] No console errors
- [ ] LocalStorage works

### Known Browser Differences

- **Safari**: May require different speech recognition API
- **Firefox**: Different IndexedDB implementation
- **Edge**: Generally compatible with Chrome
- **Chrome**: Best PWA support

---

## 📱 Mobile Testing

### Devices to Test

1. **iOS** (Priority: High)
   - [ ] iPhone 12/13/14 (Safari)
   - [ ] iPad (Safari)
   - [ ] Portrait and landscape

2. **Android** (Priority: High)
   - [ ] Samsung Galaxy S21+ (Chrome)
   - [ ] Google Pixel 6+ (Chrome)
   - [ ] Portrait and landscape

### Mobile-Specific Tests

1. **Responsive Design**
   - [ ] Dashboard layout adapts
   - [ ] Navigation menu (hamburger or bottom nav)
   - [ ] Forms readable and usable
   - [ ] Buttons large enough (min 44px)
   - [ ] Text readable (min 16px)
   - [ ] No horizontal scrolling
   - [ ] Charts scale properly
   - [ ] Mind map navigable

2. **Touch Interactions**
   - [ ] Tap targets large enough
   - [ ] Swipe gestures (if applicable)
   - [ ] Scroll smooth
   - [ ] Pinch zoom works on mind map
   - [ ] No tap delay
   - [ ] Keyboard appears for inputs

3. **PWA Installation**
   - [ ] iOS: Safari > Share > Add to Home Screen
   - [ ] Android: Chrome > Menu > Install App
   - [ ] App icon appears on home screen
   - [ ] Splash screen displays
   - [ ] Runs in standalone mode
   - [ ] No browser chrome visible

4. **Performance**
   - [ ] Pages load quickly (<3s)
   - [ ] Animations smooth (60fps)
   - [ ] No janky scrolling
   - [ ] Battery usage reasonable

5. **Orientation**
   - [ ] Portrait mode works
   - [ ] Landscape mode works
   - [ ] Rotation smooth
   - [ ] Layout adapts

### Mobile Testing Tools

```bash
# Chrome DevTools Device Mode
1. Open DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select device (iPhone 12 Pro, Pixel 5, etc.)
4. Test interactions

# BrowserStack (cloud testing)
# Visit: https://www.browserstack.com
# Test on real devices
```

---

## ⚡ Performance Testing

### Lighthouse Audit

```bash
# Run Lighthouse in Chrome DevTools
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select categories:
   - Performance ✓
   - Accessibility ✓
   - Best Practices ✓
   - SEO ✓
   - PWA ✓
4. Click "Analyze page load"
5. Review scores (aim for 90+)
```

**Target Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+
- PWA: 100

### Performance Metrics

1. **Loading Performance**
   - [ ] First Contentful Paint (FCP) < 1.8s
   - [ ] Largest Contentful Paint (LCP) < 2.5s
   - [ ] Time to Interactive (TTI) < 3.8s
   - [ ] Total Blocking Time (TBT) < 200ms
   - [ ] Cumulative Layout Shift (CLS) < 0.1

2. **Bundle Size**
   ```bash
   cd frontend
   npm run build
   du -sh dist/*
   ```
   - [ ] Main bundle < 500KB (gzipped)
   - [ ] Vendor bundle < 1MB (gzipped)
   - [ ] Total < 2MB

3. **API Response Times**
   - [ ] Authentication < 500ms
   - [ ] Word analysis < 2s
   - [ ] Quest generation < 5s
   - [ ] Analytics < 1s
   - [ ] Export < 3s

4. **Database Queries**
   - [ ] Most queries < 100ms
   - [ ] Complex queries < 500ms
   - [ ] Proper indexing on frequently queried columns

### Load Testing

```bash
# Install Apache Bench (if needed)
sudo apt-get install apache2-utils

# Test health endpoint
ab -n 1000 -c 10 http://localhost:8080/health

# Test API endpoint (with auth)
ab -n 100 -c 5 -H "Authorization: Bearer YOUR_TOKEN" \
   http://localhost:8080/api/v1/analytics/stats
```

**Target Results:**
- [ ] 100 req/s minimum
- [ ] < 100ms average response
- [ ] 0% error rate
- [ ] Memory usage stable

---

## 🔒 Security Testing

### Authentication & Authorization

1. **JWT Security**
   - [ ] Token expires after configured time
   - [ ] Refresh token works
   - [ ] Invalid token rejected
   - [ ] Expired token rejected
   - [ ] Token includes correct claims
   - [ ] Secret key strong (256-bit)

2. **Password Security**
   - [ ] Passwords hashed (bcrypt)
   - [ ] Salt used
   - [ ] Min 8 characters enforced
   - [ ] Complexity requirements
   - [ ] Not stored in plaintext
   - [ ] Not logged

3. **Session Management**
   - [ ] Session timeout works
   - [ ] Logout clears session completely
   - [ ] No session fixation
   - [ ] CSRF protection (if stateful)

### Input Validation

1. **Frontend Validation**
   - [ ] Email format checked
   - [ ] Password strength enforced
   - [ ] Username format validated
   - [ ] XSS prevention (sanitized inputs)
   - [ ] SQL injection prevented (parameterized queries)

2. **Backend Validation**
   - [ ] All inputs validated
   - [ ] SQL injection prevented
   - [ ] NoSQL injection prevented
   - [ ] Command injection prevented
   - [ ] Path traversal prevented

### API Security

1. **Rate Limiting**
   - [ ] Login rate limited (5 req/min)
   - [ ] API rate limited (100 req/min)
   - [ ] 429 status returned when exceeded
   - [ ] Per-IP limiting works
   - [ ] Per-user limiting works

2. **CORS**
   - [ ] Allowed origins configured
   - [ ] Credentials allowed for trusted origins
   - [ ] Preflight requests handled
   - [ ] Not allowing `*` in production

3. **Headers**
   - [ ] `Strict-Transport-Security` set
   - [ ] `X-Frame-Options: SAMEORIGIN`
   - [ ] `X-Content-Type-Options: nosniff`
   - [ ] `X-XSS-Protection: 1; mode=block`
   - [ ] `Content-Security-Policy` set

### Dependency Security

```bash
# Check Go dependencies
cd backend
go list -m -u all | grep '\['

# Check npm dependencies
cd frontend
npm audit
npm audit fix

# Check for vulnerabilities
npm install -g snyk
snyk test
```

- [ ] No critical vulnerabilities
- [ ] No high vulnerabilities
- [ ] Medium/low vulnerabilities assessed
- [ ] Dependencies up to date

---

## ♿ Accessibility Testing

### WCAG 2.1 Compliance

Target: **Level AA**

### Keyboard Navigation

- [ ] All interactive elements focusable
- [ ] Tab order logical
- [ ] Focus visible (outline)
- [ ] Can navigate entire app with keyboard
- [ ] Escape closes modals
- [ ] Enter activates buttons
- [ ] Arrow keys work where applicable

### Screen Reader Testing

**Tools**: NVDA (Windows), JAWS (Windows), VoiceOver (Mac)

- [ ] All images have alt text
- [ ] Form labels associated
- [ ] ARIA labels where needed
- [ ] Headings hierarchy (h1 > h2 > h3)
- [ ] Landmarks used (nav, main, aside)
- [ ] Link text descriptive
- [ ] Error messages announced

### Visual Accessibility

1. **Color Contrast**
   - [ ] Text contrast ratio ≥ 4.5:1
   - [ ] Large text contrast ≥ 3:1
   - [ ] Interactive elements contrast ≥ 3:1
   - [ ] Not relying on color alone

2. **Text**
   - [ ] Font size ≥ 16px
   - [ ] Line height ≥ 1.5
   - [ ] Paragraph spacing ≥ 2em
   - [ ] Text resizable to 200%
   - [ ] No loss of content when zoomed

3. **Focus Indicators**
   - [ ] All interactive elements have focus style
   - [ ] Focus visible against background
   - [ ] Focus order logical

### Testing Tools

```bash
# axe DevTools (Chrome Extension)
# Install from Chrome Web Store
# Run automated scan

# WAVE (Web Accessibility Evaluation Tool)
# Visit: https://wave.webaim.org
# Enter your URL
```

---

## ✅ Pre-Launch Checklist

### Environment Setup

**Production Environment:**
- [ ] PostgreSQL database created
- [ ] Database credentials secured
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Firewall rules set
- [ ] Backup system configured

**API Keys:**
- [ ] Claude API key obtained and configured
- [ ] Gemini API key obtained and configured
- [ ] Keys stored as secrets (not in code)
- [ ] Keys tested and working

### Build & Deploy

**Backend:**
```bash
cd backend
go build -o synapse cmd/api/main.go
# Binary created successfully
```

**Frontend:**
```bash
cd frontend
npm run build
# Check dist/ folder created
# Verify assets optimized
```

**Docker:**
```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
# All containers running
# Health checks passing
```

### Database

- [ ] Schema initialized
- [ ] Migrations tested
- [ ] Indexes created
- [ ] Backup scheduled (daily)
- [ ] Restore tested
- [ ] Connection pooling configured

### Monitoring

- [ ] Health endpoints responding
  - `GET /health` → 200 OK
  - `GET /ready` → 200 OK
  - `GET /live` → 200 OK
- [ ] System stats accessible (with auth)
- [ ] Logs configured
- [ ] Error tracking set up (optional: Sentry)
- [ ] Uptime monitoring (optional: UptimeRobot)

### Security

- [ ] HTTPS enabled
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS configured for production domain
- [ ] Secrets not in version control
- [ ] Database password strong
- [ ] JWT secret strong (256-bit)

### Content

- [ ] PWA icons generated ✓
- [ ] PWA screenshots generated (TODO)
- [ ] Manifest.json configured ✓
- [ ] Service worker tested
- [ ] Favicon set
- [ ] Meta tags set (title, description)
- [ ] OG tags set (social sharing)

### Documentation

- [ ] API documentation (Swagger) accessible
- [ ] README.md updated
- [ ] DEPLOYMENT.md complete ✓
- [ ] User guide created (optional)
- [ ] Admin guide created (optional)

### Legal & Compliance

- [ ] Privacy policy (if collecting data)
- [ ] Terms of service
- [ ] GDPR compliance (EU users)
  - Export/import ✓
  - Data deletion
  - Cookie consent
- [ ] Copyright notices

### Final Checks

- [ ] All tests passing
- [ ] No console errors
- [ ] No broken links
- [ ] All images loading
- [ ] All fonts loading
- [ ] Favicon displays
- [ ] PWA installable
- [ ] Mobile responsive
- [ ] Cross-browser compatible
- [ ] Performance optimized (Lighthouse 90+)
- [ ] Accessibility compliant (WCAG AA)
- [ ] SEO optimized

---

## 🔧 Testing Scripts

### Automated Test Runner

Create `scripts/test-all.sh`:

```bash
#!/bin/bash
set -e

echo "🧪 Running Synapse Test Suite..."
echo ""

# Backend tests
echo "📦 Testing Backend..."
cd backend
go test ./... -v

# Frontend tests
echo "🎨 Testing Frontend..."
cd ../frontend
npm test

# Integration tests
echo "🔗 Running Integration Tests..."
# Add integration test commands here

# Linting
echo "🔍 Linting Code..."
cd ../backend
golangci-lint run ./...

cd ../frontend
npm run lint

echo ""
echo "✅ All tests passed!"
```

### Health Check Script

Create `scripts/health-check.sh`:

```bash
#!/bin/bash

BASE_URL="${1:-http://localhost:8080}"

echo "🏥 Checking Synapse Health..."
echo "Base URL: $BASE_URL"
echo ""

# Health endpoint
echo -n "Health: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/health)
if [ $STATUS -eq 200 ]; then
    echo "✅ OK"
else
    echo "❌ FAILED (HTTP $STATUS)"
fi

# Ready endpoint
echo -n "Ready: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/ready)
if [ $STATUS -eq 200 ]; then
    echo "✅ OK"
else
    echo "❌ FAILED (HTTP $STATUS)"
fi

# Live endpoint
echo -n "Live: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/live)
if [ $STATUS -eq 200 ]; then
    echo "✅ OK"
else
    echo "❌ FAILED (HTTP $STATUS)"
fi

echo ""
echo "🏥 Health check complete"
```

### Performance Test Script

Create `scripts/perf-test.sh`:

```bash
#!/bin/bash

URL="${1:-http://localhost:8080/health}"
REQUESTS="${2:-1000}"
CONCURRENCY="${3:-10}"

echo "⚡ Running Performance Test..."
echo "URL: $URL"
echo "Requests: $REQUESTS"
echo "Concurrency: $CONCURRENCY"
echo ""

ab -n $REQUESTS -c $CONCURRENCY $URL

echo ""
echo "⚡ Performance test complete"
```

---

## 📝 Test Report Template

After testing, document results:

```markdown
# Synapse Test Report

**Date**: YYYY-MM-DD
**Tester**: Your Name
**Version**: 1.0.0
**Environment**: Production/Staging

## Summary
- Total Tests: X
- Passed: Y
- Failed: Z
- Skipped: W

## Browser Testing
- Chrome: ✅/❌
- Firefox: ✅/❌
- Safari: ✅/❌
- Edge: ✅/❌

## Mobile Testing
- iOS Safari: ✅/❌
- Android Chrome: ✅/❌

## Performance
- Lighthouse Score: X/100
- Load Time: Xs
- Bundle Size: XMB

## Issues Found
1. [Issue description]
   - Severity: Critical/High/Medium/Low
   - Status: Open/Fixed
   - Steps to reproduce

## Recommendations
- [Recommendation 1]
- [Recommendation 2]
```

---

## 🎯 Next Steps

1. **Run Quick Smoke Test** (5 min)
2. **Run Functional Tests** (30 min)
3. **Cross-Browser Testing** (30 min)
4. **Mobile Testing** (30 min)
5. **Performance Audit** (15 min)
6. **Security Check** (15 min)
7. **Accessibility Test** (15 min)
8. **Complete Pre-Launch Checklist**
9. **Generate Test Report**
10. **Deploy to Production** 🚀

---

**Total Estimated Time**: 2-3 hours
**Critical Path**: Smoke → Functional → Performance → Deploy
**Optional**: Admin panel, advanced testing

**Status**: Ready for testing! All infrastructure in place. 🎉
