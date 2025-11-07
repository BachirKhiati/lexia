package middleware

import (
	"net/http"
	"strings"
)

// SecurityHeaders adds security-related HTTP headers
func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Prevent clickjacking
		w.Header().Set("X-Frame-Options", "DENY")

		// Prevent MIME-sniffing
		w.Header().Set("X-Content-Type-Options", "nosniff")

		// Enable XSS protection
		w.Header().Set("X-XSS-Protection", "1; mode=block")

		// Referrer policy
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")

		// Content Security Policy
		csp := []string{
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' 'unsafe-eval'",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: https:",
			"font-src 'self' data:",
			"connect-src 'self' https://api.anthropic.com https://generativelanguage.googleapis.com",
			"frame-ancestors 'none'",
		}
		w.Header().Set("Content-Security-Policy", strings.Join(csp, "; "))

		// Strict Transport Security (HSTS)
		// Only add this if using HTTPS in production
		if r.TLS != nil {
			w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		}

		// Permissions Policy (formerly Feature Policy)
		w.Header().Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

		next.ServeHTTP(w, r)
	})
}

// RequestSizeLimit limits the size of request bodies
func RequestSizeLimit(maxBytes int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
			next.ServeHTTP(w, r)
		})
	}
}

// NoCache adds headers to prevent caching of sensitive endpoints
func NoCache(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, private")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
		next.ServeHTTP(w, r)
	})
}

// ValidateContentType ensures the request has the correct content type
func ValidateContentType(contentType string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Only check for POST, PUT, PATCH
			if r.Method == "POST" || r.Method == "PUT" || r.Method == "PATCH" {
				ct := r.Header.Get("Content-Type")
				if !strings.Contains(ct, contentType) {
					http.Error(w, "Invalid Content-Type. Expected "+contentType, http.StatusUnsupportedMediaType)
					return
				}
			}
			next.ServeHTTP(w, r)
		})
	}
}

// IPWhitelist restricts access to specific IP addresses
type IPWhitelist struct {
	allowedIPs map[string]bool
}

// NewIPWhitelist creates a new IP whitelist
func NewIPWhitelist(ips []string) *IPWhitelist {
	allowed := make(map[string]bool)
	for _, ip := range ips {
		allowed[ip] = true
	}
	return &IPWhitelist{allowedIPs: allowed}
}

// Middleware returns the HTTP middleware
func (ipw *IPWhitelist) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := getIP(r)

		// If whitelist is empty, allow all
		if len(ipw.allowedIPs) == 0 {
			next.ServeHTTP(w, r)
			return
		}

		// Check if IP is whitelisted
		if !ipw.allowedIPs[ip] {
			http.Error(w, "Access denied", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// CSRF protection middleware (simple token-based)
type CSRFProtection struct {
	tokenHeader string
	tokenCookie string
}

// NewCSRFProtection creates a new CSRF protection middleware
func NewCSRFProtection() *CSRFProtection {
	return &CSRFProtection{
		tokenHeader: "X-CSRF-Token",
		tokenCookie: "csrf_token",
	}
}

// Middleware returns the HTTP middleware
func (csrf *CSRFProtection) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip CSRF check for safe methods
		if r.Method == "GET" || r.Method == "HEAD" || r.Method == "OPTIONS" {
			next.ServeHTTP(w, r)
			return
		}

		// Get token from header
		headerToken := r.Header.Get(csrf.tokenHeader)

		// Get token from cookie
		cookie, err := r.Cookie(csrf.tokenCookie)
		if err != nil || cookie.Value == "" {
			http.Error(w, "CSRF token missing", http.StatusForbidden)
			return
		}

		// Validate tokens match
		if headerToken != cookie.Value {
			http.Error(w, "CSRF token mismatch", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}
