package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/BachirKhiati/lexia/internal/database"
)

type UserHandler struct {
	db *database.DB
}

func NewUserHandler(db *database.DB) *UserHandler {
	return &UserHandler{db: db}
}

type UserProgress struct {
	WordsMastered    int    `json:"words_mastered"`
	QuestsCompleted  int    `json:"quests_completed"`
	StreakDays       int    `json:"streak_days"`
	LastActiveAt     string `json:"last_active_at"`
}

// GetProgress returns the current user's learning progress stats
func (h *UserHandler) GetProgress(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := r.Context().Value("user_id").(int)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var progress UserProgress

	// First, try to get from user_progress table
	err := h.db.QueryRow(`
		SELECT words_mastered, quests_completed, streak_days, last_active_at
		FROM user_progress
		WHERE user_id = $1
	`, userID).Scan(&progress.WordsMastered, &progress.QuestsCompleted, &progress.StreakDays, &progress.LastActiveAt)

	if err == sql.ErrNoRows {
		// If no progress record exists, calculate from actual data
		var wordsMastered, questsCompleted int

		// Count mastered words
		err = h.db.QueryRow(`
			SELECT COUNT(*) FROM words WHERE user_id = $1 AND status = 'solid'
		`, userID).Scan(&wordsMastered)
		if err != nil {
			wordsMastered = 0
		}

		// Count completed quests
		err = h.db.QueryRow(`
			SELECT COUNT(*) FROM quests WHERE user_id = $1 AND status = 'completed'
		`, userID).Scan(&questsCompleted)
		if err != nil {
			questsCompleted = 0
		}

		// Create initial progress record
		_, err = h.db.Exec(`
			INSERT INTO user_progress (user_id, words_mastered, quests_completed, streak_days)
			VALUES ($1, $2, $3, 0)
			ON CONFLICT (user_id) DO UPDATE
			SET words_mastered = $2, quests_completed = $3, updated_at = NOW()
		`, userID, wordsMastered, questsCompleted)

		if err != nil {
			http.Error(w, "Failed to initialize progress", http.StatusInternalServerError)
			return
		}

		progress = UserProgress{
			WordsMastered:   wordsMastered,
			QuestsCompleted: questsCompleted,
			StreakDays:      0,
			LastActiveAt:    "",
		}
	} else if err != nil {
		http.Error(w, "Failed to fetch progress", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(progress)
}
