package middleware

import (
	"context"
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
			if authHeader == "" {
				http.Error(w, "Authorization header required", http.StatusUnauthorized)
				return
			}

			// Extract token (format: "Bearer <token>")
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
				return
			}

			token := parts[1]

			// Validate token
			claims, err := authService.ValidateToken(token)
			if err != nil {
				if err == auth.ErrExpiredToken {
					http.Error(w, "Token has expired", http.StatusUnauthorized)
				} else {
					http.Error(w, "Invalid token", http.StatusUnauthorized)
				}
				return
			}

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
