package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"golang.org/x/time/rate"
)

func TestRateLimiter(t *testing.T) {
	// Create a very restrictive rate limiter for testing (1 request per second)
	limiter := NewRateLimiter(rate.Every(1*time.Second), 1)

	handler := limiter.Limit(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}))

	// First request should succeed
	req1 := httptest.NewRequest("GET", "/test", nil)
	req1.RemoteAddr = "192.168.1.1:12345"
	rr1 := httptest.NewRecorder()
	handler.ServeHTTP(rr1, req1)

	if rr1.Code != http.StatusOK {
		t.Errorf("First request failed: got status %d, want %d", rr1.Code, http.StatusOK)
	}

	// Second request immediately after should be rate limited
	req2 := httptest.NewRequest("GET", "/test", nil)
	req2.RemoteAddr = "192.168.1.1:12345"
	rr2 := httptest.NewRecorder()
	handler.ServeHTTP(rr2, req2)

	if rr2.Code != http.StatusTooManyRequests {
		t.Errorf("Second request should be rate limited: got status %d, want %d", rr2.Code, http.StatusTooManyRequests)
	}

	// Different IP should not be rate limited
	req3 := httptest.NewRequest("GET", "/test", nil)
	req3.RemoteAddr = "192.168.1.2:12345"
	rr3 := httptest.NewRecorder()
	handler.ServeHTTP(rr3, req3)

	if rr3.Code != http.StatusOK {
		t.Errorf("Different IP should succeed: got status %d, want %d", rr3.Code, http.StatusOK)
	}
}

func TestRateLimiter_XForwardedFor(t *testing.T) {
	limiter := NewRateLimiter(rate.Every(1*time.Second), 1)

	handler := limiter.Limit(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// First request with X-Forwarded-For header
	req1 := httptest.NewRequest("GET", "/test", nil)
	req1.Header.Set("X-Forwarded-For", "10.0.0.1")
	rr1 := httptest.NewRecorder()
	handler.ServeHTTP(rr1, req1)

	if rr1.Code != http.StatusOK {
		t.Errorf("First request failed: got status %d, want %d", rr1.Code, http.StatusOK)
	}

	// Second request with same X-Forwarded-For should be rate limited
	req2 := httptest.NewRequest("GET", "/test", nil)
	req2.Header.Set("X-Forwarded-For", "10.0.0.1")
	rr2 := httptest.NewRecorder()
	handler.ServeHTTP(rr2, req2)

	if rr2.Code != http.StatusTooManyRequests {
		t.Errorf("Second request should be rate limited: got status %d, want %d", rr2.Code, http.StatusTooManyRequests)
	}
}

func TestStandardRateLimit(t *testing.T) {
	limiter := StandardRateLimit()

	if limiter.rate <= 0 {
		t.Error("StandardRateLimit should have positive rate")
	}

	if limiter.burst <= 0 {
		t.Error("StandardRateLimit should have positive burst")
	}
}

func TestStrictRateLimit(t *testing.T) {
	limiter := StrictRateLimit()

	if limiter.rate <= 0 {
		t.Error("StrictRateLimit should have positive rate")
	}

	if limiter.burst <= 0 {
		t.Error("StrictRateLimit should have positive burst")
	}

	// Strict should be more restrictive than standard
	standard := StandardRateLimit()
	if limiter.burst >= standard.burst {
		t.Error("StrictRateLimit should have smaller burst than StandardRateLimit")
	}
}

func TestGenerousRateLimit(t *testing.T) {
	limiter := GenerousRateLimit()

	if limiter.rate <= 0 {
		t.Error("GenerousRateLimit should have positive rate")
	}

	if limiter.burst <= 0 {
		t.Error("GenerousRateLimit should have positive burst")
	}

	// Generous should be more permissive than standard
	standard := StandardRateLimit()
	if limiter.burst <= standard.burst {
		t.Error("GenerousRateLimit should have larger burst than StandardRateLimit")
	}
}

func BenchmarkRateLimiter(b *testing.B) {
	limiter := NewRateLimiter(rate.Every(100*time.Millisecond), 1000)

	handler := limiter.Limit(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest("GET", "/test", nil)
		req.RemoteAddr = "192.168.1.1:12345"
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)
	}
}
