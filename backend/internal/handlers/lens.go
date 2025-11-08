package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/BachirKhiati/lexia/internal/database"
	"github.com/BachirKhiati/lexia/internal/middleware"
	"github.com/BachirKhiati/lexia/internal/services/scraper"
)

type LensHandler struct {
	db             *database.DB
	scraperService *scraper.Service
}

func NewLensHandler(db *database.DB, scraperService *scraper.Service) *LensHandler {
	return &LensHandler{
		db:             db,
		scraperService: scraperService,
	}
}

type ImportRequest struct {
	URL      string `json:"url"`
	Language string `json:"language"`
}

type ImportResponse struct {
	ID      int    `json:"id"`
	Title   string `json:"title"`
	Content string `json:"content"`
	URL     string `json:"url"`
}

// ImportArticle extracts content from a URL and saves it
func (h *LensHandler) ImportArticle(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req ImportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.URL == "" {
		http.Error(w, "URL is required", http.StatusBadRequest)
		return
	}

	if req.Language == "" {
		req.Language = "finnish"
	}

	// Check if it's a YouTube URL
	if scraper.IsYouTubeURL(req.URL) {
		http.Error(w, "YouTube transcripts not yet supported", http.StatusNotImplemented)
		return
	}

	// Extract article content
	article, err := h.scraperService.ExtractArticle(req.URL)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to extract article: %v", err), http.StatusInternalServerError)
		return
	}

	// Save to database
	var articleID int
	err = h.db.QueryRow(`
		INSERT INTO articles (user_id, title, url, content, language)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`, claims.UserID, article.Title, article.URL, article.Content, req.Language).Scan(&articleID)

	if err != nil {
		http.Error(w, "Failed to save article", http.StatusInternalServerError)
		return
	}

	response := ImportResponse{
		ID:      articleID,
		Title:   article.Title,
		Content: article.Content,
		URL:     article.URL,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetUserArticles returns all articles imported by a user
func (h *LensHandler) GetUserArticles(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := h.db.Query(`
		SELECT id, title, url, content, language, added_at
		FROM articles
		WHERE user_id = $1
		ORDER BY added_at DESC
		LIMIT 50
	`, claims.UserID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var articles []ImportResponse
	for rows.Next() {
		var article ImportResponse
		var addedAt string
		var language string
		if err := rows.Scan(&article.ID, &article.Title, &article.URL, &article.Content, &language, &addedAt); err != nil {
			continue
		}
		articles = append(articles, article)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(articles)
}
