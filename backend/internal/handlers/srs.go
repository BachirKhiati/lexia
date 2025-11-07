package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/BachirKhiati/synapse/internal/database"
	"github.com/BachirKhiati/synapse/internal/models"
	"github.com/BachirKhiati/synapse/internal/services/srs"
)

type SRSHandler struct {
	db         *database.DB
	srsService *srs.Service
}

func NewSRSHandler(db *database.DB, srsService *srs.Service) *SRSHandler {
	return &SRSHandler{
		db:         db,
		srsService: srsService,
	}
}

// GetDueWords returns words that are due for review
// @Summary Get due words for review
// @Description Get words that are due for spaced repetition review
// @Tags SRS
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.Word "List of words due for review"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Failed to fetch words"
// @Router /srs/due [get]
func (h *SRSHandler) GetDueWords(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := r.Context().Value("user_id").(int)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Query words due for review
	query := `
		SELECT id, user_id, word, lemma, language, definition, part_of_speech,
		       examples, status, added_at, mastered_at,
		       ease_factor, repetition_count, interval, next_review_at, last_reviewed_at
		FROM words
		WHERE user_id = $1
		  AND (next_review_at IS NULL OR next_review_at <= NOW())
		  AND status != 'solid'
		ORDER BY next_review_at ASC NULLS FIRST
		LIMIT 20
	`

	rows, err := h.db.Query(query, userID)
	if err != nil {
		http.Error(w, "Failed to fetch words", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var words []models.Word
	for rows.Scan() {
		var word models.Word
		var examples sql.NullString

		err := rows.Scan(
			&word.ID, &word.UserID, &word.Word, &word.Lemma, &word.Language,
			&word.Definition, &word.PartOfSpeech, &examples, &word.Status,
			&word.AddedAt, &word.MasteredAt,
			&word.EaseFactor, &word.RepetitionCount, &word.Interval,
			&word.NextReviewAt, &word.LastReviewedAt,
		)
		if err != nil {
			continue
		}

		// Parse examples array
		if examples.Valid {
			if err := json.Unmarshal([]byte(examples.String), &word.Examples); err != nil {
				word.Examples = []string{}
			}
		}

		words = append(words, word)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(words)
}

// SubmitReview processes a word review and updates SRS parameters
// @Summary Submit word review
// @Description Submit a review for a word and update its SRS parameters using SM-2 algorithm
// @Tags SRS
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.ReviewRequest true "Review data with quality rating (0-5)"
// @Success 200 {object} models.ReviewResponse "Updated word with next review date"
// @Failure 400 {object} map[string]string "Invalid request or quality value"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "Word not found"
// @Failure 500 {object} map[string]string "Failed to update word"
// @Router /srs/review [post]
func (h *SRSHandler) SubmitReview(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := r.Context().Value("user_id").(int)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req models.ReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate quality (0-5)
	if req.Quality < 0 || req.Quality > 5 {
		http.Error(w, "Quality must be between 0 and 5", http.StatusBadRequest)
		return
	}

	// Get current word data
	var word models.Word
	var examples sql.NullString

	err := h.db.QueryRow(`
		SELECT id, user_id, word, lemma, language, definition, part_of_speech,
		       examples, status, added_at, mastered_at,
		       ease_factor, repetition_count, interval, next_review_at, last_reviewed_at
		FROM words
		WHERE id = $1 AND user_id = $2
	`, req.WordID, userID).Scan(
		&word.ID, &word.UserID, &word.Word, &word.Lemma, &word.Language,
		&word.Definition, &word.PartOfSpeech, &examples, &word.Status,
		&word.AddedAt, &word.MasteredAt,
		&word.EaseFactor, &word.RepetitionCount, &word.Interval,
		&word.NextReviewAt, &word.LastReviewedAt,
	)

	if err == sql.ErrNoRows {
		http.Error(w, "Word not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to fetch word", http.StatusInternalServerError)
		return
	}

	// Parse examples
	if examples.Valid {
		json.Unmarshal([]byte(examples.String), &word.Examples)
	}

	// Calculate next review using SM-2 algorithm
	result := h.srsService.CalculateNextReview(
		srs.Quality(req.Quality),
		word.EaseFactor,
		word.RepetitionCount,
		word.Interval,
	)

	// Update word in database
	now := time.Now()
	_, err = h.db.Exec(`
		UPDATE words
		SET ease_factor = $1,
		    repetition_count = $2,
		    interval = $3,
		    next_review_at = $4,
		    last_reviewed_at = $5
		WHERE id = $6
	`, result.EaseFactor, result.RepetitionCount, result.Interval,
		result.NextReviewAt, now, word.ID)

	if err != nil {
		http.Error(w, "Failed to update word", http.StatusInternalServerError)
		return
	}

	// Update word object with new values
	word.EaseFactor = result.EaseFactor
	word.RepetitionCount = result.RepetitionCount
	word.Interval = result.Interval
	word.NextReviewAt = &result.NextReviewAt
	word.LastReviewedAt = &now

	// Generate friendly message
	var message string
	switch {
	case req.Quality >= 4:
		message = "Great job! You'll see this word again in " + formatInterval(result.Interval)
	case req.Quality >= 3:
		message = "Good! Review scheduled in " + formatInterval(result.Interval)
	default:
		message = "Keep practicing! You'll review this again tomorrow."
	}

	response := models.ReviewResponse{
		Word:         &word,
		NextInterval: result.Interval,
		Message:      message,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// formatInterval returns a human-readable interval string
func formatInterval(days int) string {
	if days == 1 {
		return "1 day"
	} else if days < 7 {
		return string(rune(days)) + " days"
	} else if days < 30 {
		weeks := days / 7
		if weeks == 1 {
			return "1 week"
		}
		return string(rune(weeks)) + " weeks"
	} else {
		months := days / 30
		if months == 1 {
			return "1 month"
		}
		return string(rune(months)) + " months"
	}
}
