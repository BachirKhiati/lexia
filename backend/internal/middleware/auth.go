package middleware

import (
	"context"
	"log"
	"net/http"
	"strings"

	"github.com/BachirKhiati/lexia/internal/services/auth"
)

type contextKey string

const UserContextKey contextKey = "user"

// Auth middleware validates JWT tokens and adds user info to context
func Auth(authService *auth.Service) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get token from Authorization header
			authHeader := r.Header.Get("Authorization")
			log.Printf("[AUTH] Request to %s - Auth header present: %v", r.URL.Path, authHeader != "")

			if authHeader == "" {
				log.Printf("[AUTH] No Authorization header for %s", r.URL.Path)
				http.Error(w, "Authorization header required", http.StatusUnauthorized)
				return
			}

			// Extract token (format: "Bearer <token>")
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				log.Printf("[AUTH] Invalid Authorization header format for %s: %s", r.URL.Path, authHeader)
				http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
				return
			}

			token := parts[1]
			tokenPreview := token
			if len(token) > 20 {
				tokenPreview = token[:20]
			}
			log.Printf("[AUTH] Token received (first 20 chars): %s...", tokenPreview)

			// Validate token
			claims, err := authService.ValidateToken(token)
			if err != nil {
				log.Printf("[AUTH] Token validation failed for %s: %v", r.URL.Path, err)
				if err == auth.ErrExpiredToken {
					http.Error(w, "Token has expired", http.StatusUnauthorized)
				} else {
					http.Error(w, "Invalid token", http.StatusUnauthorized)
				}
				return
			}

			log.Printf("[AUTH] Token validated successfully for user %d (%s)", claims.UserID, claims.Email)

			// Add user info to context
			ctx := context.WithValue(r.Context(), UserContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserFromContext retrieves user claims from request context
func GetUserFromContext(r *http.Request) (*auth.Claims, bool) {
	claims, ok := r.Context().Value(UserContextKey).(*auth.Claims)
	return claims, ok
}
