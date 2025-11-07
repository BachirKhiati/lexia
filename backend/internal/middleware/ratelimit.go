package middleware

import (
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// RateLimiter implements rate limiting using token bucket algorithm
type RateLimiter struct {
	visitors map[string]*visitor
	mu       sync.RWMutex
	rate     rate.Limit
	burst    int
}

type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// NewRateLimiter creates a new rate limiter
// rate: requests per second
// burst: maximum burst size
func NewRateLimiter(r rate.Limit, b int) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*visitor),
		rate:     r,
		burst:    b,
	}

	// Clean up old visitors every 5 minutes
	go rl.cleanupVisitors()

	return rl
}

// getVisitor returns the rate limiter for the given IP
func (rl *RateLimiter) getVisitor(ip string) *rate.Limiter {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	v, exists := rl.visitors[ip]
	if !exists {
		limiter := rate.NewLimiter(rl.rate, rl.burst)
		rl.visitors[ip] = &visitor{limiter, time.Now()}
		return limiter
	}

	v.lastSeen = time.Now()
	return v.limiter
}

// cleanupVisitors removes visitors that haven't been seen in 3 minutes
func (rl *RateLimiter) cleanupVisitors() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for {
		<-ticker.C
		rl.mu.Lock()
		for ip, v := range rl.visitors {
			if time.Since(v.lastSeen) > 3*time.Minute {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}

// Limit is the middleware function for rate limiting
func (rl *RateLimiter) Limit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := getIP(r)
		limiter := rl.getVisitor(ip)

		if !limiter.Allow() {
			w.Header().Set("X-RateLimit-Retry-After", "60")
			http.Error(w, "Rate limit exceeded. Please try again later.", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// getIP extracts the real IP address from the request
func getIP(r *http.Request) string {
	// Check X-Forwarded-For header (proxy/load balancer)
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		return forwarded
	}

	// Check X-Real-IP header
	realIP := r.Header.Get("X-Real-IP")
	if realIP != "" {
		return realIP
	}

	// Fall back to RemoteAddr
	return r.RemoteAddr
}

// StrictRateLimit creates a stricter rate limiter for sensitive endpoints
// 10 requests per minute
func StrictRateLimit() *RateLimiter {
	return NewRateLimiter(rate.Every(6*time.Second), 10)
}

// StandardRateLimit creates a standard rate limiter
// 100 requests per minute
func StandardRateLimit() *RateLimiter {
	return NewRateLimiter(rate.Every(600*time.Millisecond), 100)
}

// GenerousRateLimit creates a generous rate limiter for read operations
// 300 requests per minute
func GenerousRateLimit() *RateLimiter {
	return NewRateLimiter(rate.Every(200*time.Millisecond), 300)
}
