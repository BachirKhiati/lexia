package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/BachirKhiati/synapse/internal/database"
	"github.com/BachirKhiati/synapse/internal/services/auth"
)

type AnalyticsHandler struct {
	db *database.DB
}

func NewAnalyticsHandler(db *database.DB) *AnalyticsHandler {
	return &AnalyticsHandler{db: db}
}

// LearningStats contains overall learning statistics
type LearningStats struct {
	TotalWords        int     `json:"total_words"`
	WordsMastered     int     `json:"words_mastered"`
	GhostWords        int     `json:"ghost_words"`
	SolidWords        int     `json:"solid_words"`
	QuestsCompleted   int     `json:"quests_completed"`
	QuestsPending     int     `json:"quests_pending"`
	CurrentStreak     int     `json:"current_streak"`
	LongestStreak     int     `json:"longest_streak"`
	WordsDueToday     int     `json:"words_due_today"`
	AverageEaseFactor float64 `json:"average_ease_factor"`
	TotalReviews      int     `json:"total_reviews"`
}

// WordsOverTime represents words mastered over time
type WordsOverTime struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

// QuestsOverTime represents quests completed over time
type QuestsOverTime struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

// ReviewActivity represents review activity by day
type ReviewActivity struct {
	Date   string `json:"date"`
	Count  int    `json:"count"`
	Passed int    `json:"passed"`
	Failed int    `json:"failed"`
}

// WordsByPartOfSpeech shows distribution of words
type WordsByPartOfSpeech struct {
	PartOfSpeech string `json:"part_of_speech"`
	Count        int    `json:"count"`
}

// ChallengingWords shows words with lowest ease factor
type ChallengingWords struct {
	Word       string  `json:"word"`
	Definition string  `json:"definition"`
	EaseFactor float64 `json:"ease_factor"`
	Reviews    int     `json:"reviews"`
}

// GetLearningStats returns overall learning statistics
// @Summary Get learning statistics
// @Description Get comprehensive learning statistics for the authenticated user
// @Tags Analytics
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} LearningStats "Learning statistics"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /analytics/stats [get]
func (h *AnalyticsHandler) GetLearningStats(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	stats := LearningStats{}

	// Total words
	err := h.db.QueryRow(`
		SELECT COUNT(*) FROM words WHERE user_id = $1
	`, claims.UserID).Scan(&stats.TotalWords)
	if err != nil && err != sql.ErrNoRows {
		http.Error(w, "Failed to fetch statistics", http.StatusInternalServerError)
		return
	}

	// Words by status
	rows, err := h.db.Query(`
		SELECT status, COUNT(*)
		FROM words
		WHERE user_id = $1
		GROUP BY status
	`, claims.UserID)
	if err != nil {
		http.Error(w, "Failed to fetch word statistics", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var status string
		var count int
		if err := rows.Scan(&status, &count); err == nil {
			switch status {
			case "ghost":
				stats.GhostWords = count
			case "solid":
				stats.SolidWords = count
				stats.WordsMastered = count
			}
		}
	}

	// Quests by status
	rows, err = h.db.Query(`
		SELECT status, COUNT(*)
		FROM quests
		WHERE user_id = $1
		GROUP BY status
	`, claims.UserID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var status string
			var count int
			if err := rows.Scan(&status, &count); err == nil {
				switch status {
				case "completed":
					stats.QuestsCompleted = count
				case "pending", "in_progress":
					stats.QuestsPending += count
				}
			}
		}
	}

	// Streak days
	err = h.db.QueryRow(`
		SELECT streak_days FROM user_progress WHERE user_id = $1
	`, claims.UserID).Scan(&stats.CurrentStreak)
	if err != nil && err != sql.ErrNoRows {
		stats.CurrentStreak = 0
	}
	stats.LongestStreak = stats.CurrentStreak // Simplified for now

	// Words due today
	err = h.db.QueryRow(`
		SELECT COUNT(*)
		FROM words
		WHERE user_id = $1
		AND (next_review_at IS NULL OR next_review_at <= NOW())
		AND status != 'solid'
	`, claims.UserID).Scan(&stats.WordsDueToday)
	if err != nil && err != sql.ErrNoRows {
		stats.WordsDueToday = 0
	}

	// Average ease factor
	err = h.db.QueryRow(`
		SELECT AVG(ease_factor)
		FROM words
		WHERE user_id = $1 AND ease_factor > 0
	`, claims.UserID).Scan(&stats.AverageEaseFactor)
	if err != nil && err != sql.ErrNoRows {
		stats.AverageEaseFactor = 2.5
	}

	// Total reviews (approximation based on repetition count)
	err = h.db.QueryRow(`
		SELECT SUM(repetition_count)
		FROM words
		WHERE user_id = $1
	`, claims.UserID).Scan(&stats.TotalReviews)
	if err != nil && err != sql.ErrNoRows {
		stats.TotalReviews = 0
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// GetWordsOverTime returns words mastered over time
// @Summary Get words mastered over time
// @Description Get historical data of words mastered by date
// @Tags Analytics
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param days query int false "Number of days to look back" default(30)
// @Success 200 {array} WordsOverTime "Words over time"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /analytics/words-over-time [get]
func (h *AnalyticsHandler) GetWordsOverTime(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get days parameter (default 30)
	days := 30

	rows, err := h.db.Query(`
		SELECT DATE(added_at) as date, COUNT(*) as count
		FROM words
		WHERE user_id = $1
		AND added_at >= NOW() - INTERVAL '1 day' * $2
		GROUP BY DATE(added_at)
		ORDER BY DATE(added_at) ASC
	`, claims.UserID, days)
	if err != nil {
		http.Error(w, "Failed to fetch data", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var data []WordsOverTime
	for rows.Next() {
		var item WordsOverTime
		var date time.Time
		if err := rows.Scan(&date, &item.Count); err == nil {
			item.Date = date.Format("2006-01-02")
			data = append(data, item)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

// GetQuestsOverTime returns quests completed over time
// @Summary Get quests completed over time
// @Description Get historical data of quests completed by date
// @Tags Analytics
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param days query int false "Number of days to look back" default(30)
// @Success 200 {array} QuestsOverTime "Quests over time"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /analytics/quests-over-time [get]
func (h *AnalyticsHandler) GetQuestsOverTime(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	days := 30

	rows, err := h.db.Query(`
		SELECT DATE(completed_at) as date, COUNT(*) as count
		FROM quests
		WHERE user_id = $1
		AND status = 'completed'
		AND completed_at >= NOW() - INTERVAL '1 day' * $2
		GROUP BY DATE(completed_at)
		ORDER BY DATE(completed_at) ASC
	`, claims.UserID, days)
	if err != nil {
		http.Error(w, "Failed to fetch data", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var data []QuestsOverTime
	for rows.Next() {
		var item QuestsOverTime
		var date time.Time
		if err := rows.Scan(&date, &item.Count); err == nil {
			item.Date = date.Format("2006-01-02")
			data = append(data, item)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

// GetWordsByPartOfSpeech returns distribution of words by part of speech
// @Summary Get words by part of speech
// @Description Get distribution of learned words by part of speech
// @Tags Analytics
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {array} WordsByPartOfSpeech "Words by part of speech"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /analytics/words-by-pos [get]
func (h *AnalyticsHandler) GetWordsByPartOfSpeech(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := h.db.Query(`
		SELECT
			COALESCE(part_of_speech, 'unknown') as pos,
			COUNT(*) as count
		FROM words
		WHERE user_id = $1
		GROUP BY part_of_speech
		ORDER BY count DESC
	`, claims.UserID)
	if err != nil {
		http.Error(w, "Failed to fetch data", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var data []WordsByPartOfSpeech
	for rows.Next() {
		var item WordsByPartOfSpeech
		if err := rows.Scan(&item.PartOfSpeech, &item.Count); err == nil {
			data = append(data, item)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

// GetChallengingWords returns most challenging words (lowest ease factor)
// @Summary Get most challenging words
// @Description Get words with lowest ease factor (most difficult)
// @Tags Analytics
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param limit query int false "Number of words to return" default(10)
// @Success 200 {array} ChallengingWords "Challenging words"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /analytics/challenging-words [get]
func (h *AnalyticsHandler) GetChallengingWords(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	limit := 10

	rows, err := h.db.Query(`
		SELECT word, definition, ease_factor, repetition_count
		FROM words
		WHERE user_id = $1
		AND repetition_count > 0
		ORDER BY ease_factor ASC
		LIMIT $2
	`, claims.UserID, limit)
	if err != nil {
		http.Error(w, "Failed to fetch data", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var data []ChallengingWords
	for rows.Next() {
		var item ChallengingWords
		if err := rows.Scan(&item.Word, &item.Definition, &item.EaseFactor, &item.Reviews); err == nil {
			data = append(data, item)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
