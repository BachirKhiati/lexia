# Synapse Performance Optimization Guide

This guide covers performance optimization strategies for Synapse.

## Table of Contents

1. [Backend Performance](#backend-performance)
2. [Frontend Performance](#frontend-performance)
3. [Database Optimization](#database-optimization)
4. [Caching Strategies](#caching-strategies)
5. [Network Optimization](#network-optimization)
6. [Monitoring Performance](#monitoring-performance)

---

## Backend Performance

### 1. Database Connection Pooling

Configure PostgreSQL connection pooling in `backend/internal/database/postgres.go`:

```go
db.SetMaxOpenConns(25)
db.SetMaxIdleConns(25)
db.SetConnMaxLifetime(5 * time.Minute)
```

### 2. Query Optimization

**Use prepared statements:**
```go
stmt, err := db.Prepare("SELECT * FROM words WHERE user_id = $1 AND status = $2")
defer stmt.Close()
```

**Add indexes for common queries:**
```sql
CREATE INDEX idx_words_user_status ON words(user_id, status);
CREATE INDEX idx_words_next_review ON words(user_id, next_review_at) WHERE next_review_at IS NOT NULL;
```

**Use SELECT specific columns:**
```go
// Bad
rows, err := db.Query("SELECT * FROM words")

// Good
rows, err := db.Query("SELECT id, word, definition FROM words")
```

### 3. Redis Caching

Implement caching for frequently accessed data:

```go
// Cache word definitions
func (s *Service) GetWordDefinition(word string) (string, error) {
    // Check cache first
    cached, err := s.redis.Get(ctx, "def:"+word).Result()
    if err == nil {
        return cached, nil
    }

    // Fetch from database
    definition, err := s.fetchFromDB(word)
    if err != nil {
        return "", err
    }

    // Store in cache (1 hour TTL)
    s.redis.Set(ctx, "def:"+word, definition, 1*time.Hour)

    return definition, nil
}
```

### 4. Concurrent Request Processing

Use goroutines for parallel operations:

```go
func (h *Handler) GetUserData(w http.ResponseWriter, r *http.Request) {
    var (
        words    []Word
        quests   []Quest
        progress UserProgress
        wg       sync.WaitGroup
        mu       sync.Mutex
        errors   []error
    )

    wg.Add(3)

    // Fetch words
    go func() {
        defer wg.Done()
        w, err := h.fetchWords(userID)
        mu.Lock()
        words = w
        if err != nil {
            errors = append(errors, err)
        }
        mu.Unlock()
    }()

    // Fetch quests
    go func() {
        defer wg.Done()
        q, err := h.fetchQuests(userID)
        mu.Lock()
        quests = q
        if err != nil {
            errors = append(errors, err)
        }
        mu.Unlock()
    }()

    // Fetch progress
    go func() {
        defer wg.Done()
        p, err := h.fetchProgress(userID)
        mu.Lock()
        progress = p
        if err != nil {
            errors = append(errors, err)
        }
        mu.Unlock()
    }()

    wg.Wait()

    // Handle errors and respond
}
```

### 5. Response Compression

Enable gzip compression in middleware:

```go
import "github.com/go-chi/chi/v5/middleware"

r.Use(middleware.Compress(5)) // gzip level 5
```

---

## Frontend Performance

### 1. Code Splitting

Split code by route using dynamic imports:

```typescript
import { lazy, Suspense } from 'react';

const ScribePage = lazy(() => import('./pages/ScribePage'));
const SynapsePage = lazy(() => import('./pages/SynapsePage'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/scribe" element={<ScribePage />} />
        <Route path="/synapse" element={<SynapsePage />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. React Query Caching

Optimize data fetching with React Query:

```typescript
// Configure global cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Use in components
const { data, isLoading } = useQuery({
  queryKey: ['words', userID],
  queryFn: () => fetchWords(userID),
  staleTime: 5 * 60 * 1000,
});
```

### 3. Memoization

Use React.memo and useMemo for expensive computations:

```typescript
// Memoize component
const WordCard = React.memo(({ word }: { word: Word }) => {
  return <div>{word.definition}</div>;
});

// Memoize expensive calculation
const sortedWords = useMemo(() => {
  return words.sort((a, b) => a.word.localeCompare(b.word));
}, [words]);

// Memoize callbacks
const handleClick = useCallback((wordId: number) => {
  // Handle click
}, []);
```

### 4. Virtual Scrolling

For long lists, use virtualization:

```typescript
import { FixedSizeList } from 'react-window';

function WordList({ words }: { words: Word[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={words.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {words[index].word}
        </div>
      )}
    </FixedSizeList>
  );
}
```

### 5. Image Optimization

Optimize images with lazy loading:

```typescript
<img
  src={imageUrl}
  loading="lazy"
  alt="Description"
  width={300}
  height={200}
/>
```

### 6. Bundle Analysis

Analyze and reduce bundle size:

```bash
npm run build
npm install --save-dev vite-plugin-visualizer

# In vite.config.ts
import { visualizer } from 'vite-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ],
});
```

---

## Database Optimization

### 1. Indexes

Add indexes for frequently queried columns:

```sql
-- User queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Word queries
CREATE INDEX idx_words_user_id ON words(user_id);
CREATE INDEX idx_words_status ON words(status);
CREATE INDEX idx_words_user_status ON words(user_id, status);
CREATE INDEX idx_words_next_review ON words(user_id, next_review_at)
  WHERE next_review_at IS NOT NULL;

-- Quest queries
CREATE INDEX idx_quests_user_id ON quests(user_id);
CREATE INDEX idx_quests_status ON quests(status);
CREATE INDEX idx_quests_user_status ON quests(user_id, status);

-- Full-text search (optional)
CREATE INDEX idx_words_search ON words USING GIN(to_tsvector('finnish', word || ' ' || definition));
```

### 2. Query Optimization

**Use EXPLAIN ANALYZE:**
```sql
EXPLAIN ANALYZE
SELECT * FROM words
WHERE user_id = 1 AND status = 'solid'
ORDER BY added_at DESC
LIMIT 20;
```

**Batch inserts:**
```go
// Bad - N database calls
for _, word := range words {
    db.Exec("INSERT INTO words ...", word)
}

// Good - 1 database call
stmt, _ := db.Prepare("INSERT INTO words ...")
for _, word := range words {
    stmt.Exec(word)
}
```

### 3. PostgreSQL Configuration

Tune PostgreSQL for production in `docker-compose.prod.yml`:

```yaml
command: >
  postgres
  -c shared_buffers=256MB
  -c effective_cache_size=1GB
  -c max_connections=100
  -c random_page_cost=1.1
  -c effective_io_concurrency=200
  -c work_mem=4MB
  -c maintenance_work_mem=64MB
  -c min_wal_size=1GB
  -c max_wal_size=4GB
  -c checkpoint_completion_target=0.9
```

---

## Caching Strategies

### 1. Redis Configuration

Configure Redis for optimal performance:

```yaml
redis:
  command: >
    redis-server
    --maxmemory 256mb
    --maxmemory-policy allkeys-lru
    --appendonly yes
```

### 2. Cache Hierarchy

Implement multi-level caching:

```
1. Browser Cache (static assets)
2. CDN Cache (if using CDN)
3. Redis Cache (API responses)
4. Database Query Cache
```

### 3. Cache Invalidation

```go
// Invalidate cache on updates
func (s *Service) UpdateWord(word Word) error {
    // Update database
    err := s.db.Update(word)
    if err != nil {
        return err
    }

    // Invalidate cache
    s.redis.Del(ctx, "word:"+word.ID)
    s.redis.Del(ctx, "user:words:"+word.UserID)

    return nil
}
```

---

## Network Optimization

### 1. HTTP/2

Enable HTTP/2 in Nginx:

```nginx
server {
    listen 443 ssl http2;
    # ...
}
```

### 2. Enable Compression

Nginx gzip configuration:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/javascript
    application/x-javascript
    application/xml
    application/xml+rss
    application/json;
```

### 3. CDN for Static Assets

Use a CDN for static files:

```typescript
// In vite.config.ts
export default defineConfig({
  base: process.env.CDN_URL || '/',
});
```

### 4. API Response Optimization

Reduce payload size:

```go
// Only return necessary fields
type WordSummary struct {
    ID         int    `json:"id"`
    Word       string `json:"word"`
    Definition string `json:"definition"`
}

// Instead of full Word struct
```

---

## Monitoring Performance

### 1. Backend Metrics

Add Prometheus metrics:

```go
import "github.com/prometheus/client_golang/prometheus"

var (
    httpDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "http_request_duration_seconds",
            Help: "Duration of HTTP requests.",
        },
        []string{"path", "method"},
    )
)

// Middleware
func metricsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        duration := time.Since(start).Seconds()
        httpDuration.WithLabelValues(r.URL.Path, r.Method).Observe(duration)
    })
}
```

### 2. Frontend Performance

Use Web Vitals:

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  console.log(metric);
  // Send to analytics service
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 3. Database Performance

Monitor slow queries:

```sql
-- Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1 second
SELECT pg_reload_conf();

-- View slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## Performance Checklist

### Backend
- [ ] Database connection pooling configured
- [ ] Indexes added for common queries
- [ ] Redis caching implemented
- [ ] Response compression enabled
- [ ] Concurrent request processing where applicable

### Frontend
- [ ] Code splitting implemented
- [ ] React Query caching configured
- [ ] Components memoized appropriately
- [ ] Images lazy loaded
- [ ] Bundle size analyzed and optimized

### Database
- [ ] Indexes created for all foreign keys
- [ ] Slow queries identified and optimized
- [ ] PostgreSQL configuration tuned
- [ ] Regular VACUUM and ANALYZE scheduled

### Caching
- [ ] Redis configured with LRU policy
- [ ] Cache invalidation strategy in place
- [ ] Cache hit rates monitored

### Network
- [ ] HTTP/2 enabled
- [ ] Gzip compression enabled
- [ ] CDN configured for static assets
- [ ] API responses optimized

---

## Performance Targets

| Metric | Target | Excellent |
|--------|--------|-----------|
| API Response Time (p95) | < 200ms | < 100ms |
| Database Query Time (p95) | < 50ms | < 20ms |
| Page Load Time (LCP) | < 2.5s | < 1.5s |
| First Input Delay (FID) | < 100ms | < 50ms |
| Cumulative Layout Shift | < 0.1 | < 0.05 |
| Bundle Size (initial) | < 500KB | < 300KB |

---

For monitoring setup, see [MONITORING.md](MONITORING.md)
For production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md)
