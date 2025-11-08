package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/BachirKhiati/lexia/internal/database"
	"github.com/BachirKhiati/lexia/internal/services/auth"
)

type AuthHandler struct {
	db          *database.DB
	authService *auth.Service
}

func NewAuthHandler(db *database.DB, authService *auth.Service) *AuthHandler {
	return &AuthHandler{
		db:          db,
		authService: authService,
	}
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
	Language string `json:"language"` // Target language to learn
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token    string `json:"token"`
	User     User   `json:"user"`
}

type User struct {
	ID       int    `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	Language string `json:"language"`
}

// Register creates a new user account
// @Summary Register a new user
// @Description Create a new user account with email, username, and password
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body RegisterRequest true "Registration details"
// @Success 201 {object} AuthResponse "User created successfully"
// @Failure 400 {object} map[string]string "Invalid request or validation failed"
// @Failure 409 {object} map[string]string "Email or username already exists"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /auth/register [post]
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate input
	if req.Email == "" || req.Username == "" || req.Password == "" {
		http.Error(w, "Email, username, and password are required", http.StatusBadRequest)
		return
	}

	if len(req.Password) < 8 {
		http.Error(w, "Password must be at least 8 characters", http.StatusBadRequest)
		return
	}

	// Default language
	if req.Language == "" {
		req.Language = "finnish"
	}

	// Hash password
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		http.Error(w, "Failed to process password", http.StatusInternalServerError)
		return
	}

	// Create user
	var userID int
	err = h.db.QueryRow(`
		INSERT INTO users (email, username, password_hash, language)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, strings.ToLower(req.Email), req.Username, hashedPassword, req.Language).Scan(&userID)

	if err != nil {
		if strings.Contains(err.Error(), "duplicate") {
			http.Error(w, "Email or username already exists", http.StatusConflict)
		} else {
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
		}
		return
	}

	// Initialize user progress
	_, err = h.db.Exec(`
		INSERT INTO user_progress (user_id, words_mastered, quests_completed, streak_days)
		VALUES ($1, 0, 0, 0)
	`, userID)
	if err != nil {
		// Log error but don't fail registration
	}

	// Generate JWT token
	token, err := h.authService.GenerateToken(userID, req.Email, req.Username)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	// Return response
	response := AuthResponse{
		Token: token,
		User: User{
			ID:       userID,
			Email:    req.Email,
			Username: req.Username,
			Language: req.Language,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// Login authenticates a user and returns a JWT token
// @Summary Login user
// @Description Authenticate with email and password to receive a JWT token
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Login credentials"
// @Success 200 {object} AuthResponse "Login successful"
// @Failure 400 {object} map[string]string "Invalid request"
// @Failure 401 {object} map[string]string "Invalid credentials"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /auth/login [post]
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate input
	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	// Get user from database
	var user User
	var passwordHash string
	err := h.db.QueryRow(`
		SELECT id, email, username, language, password_hash
		FROM users
		WHERE email = $1
	`, strings.ToLower(req.Email)).Scan(&user.ID, &user.Email, &user.Username, &user.Language, &passwordHash)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		} else {
			http.Error(w, "Failed to retrieve user", http.StatusInternalServerError)
		}
		return
	}

	// Check password
	if err := auth.CheckPassword(passwordHash, req.Password); err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// Update last active time
	_, err = h.db.Exec(`
		UPDATE user_progress
		SET last_active_at = NOW()
		WHERE user_id = $1
	`, user.ID)
	if err != nil {
		// Log error but don't fail login
	}

	// Generate JWT token
	token, err := h.authService.GenerateToken(user.ID, user.Email, user.Username)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	// Return response
	response := AuthResponse{
		Token: token,
		User:  user,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Me returns the current authenticated user's information
// @Summary Get current user
// @Description Get the authenticated user's profile information
// @Tags Authentication
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} User "User profile"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "User not found"
// @Router /auth/me [get]
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	// User info is already in context from middleware
	claims, ok := r.Context().Value("user").(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get full user details
	var user User
	err := h.db.QueryRow(`
		SELECT id, email, username, language
		FROM users
		WHERE id = $1
	`, claims.UserID).Scan(&user.ID, &user.Email, &user.Username, &user.Language)

	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// RefreshToken generates a new token from an existing valid token
// @Summary Refresh JWT token
// @Description Generate a new JWT token from an existing valid token
// @Tags Authentication
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]string "New token"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Failed to generate token"
// @Router /auth/refresh [post]
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Generate new token
	token, err := h.authService.GenerateToken(claims.UserID, claims.Email, claims.Username)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	response := map[string]string{"token": token}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
