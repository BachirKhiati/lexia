package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/BachirKhiati/lexia/internal/database"
	"github.com/BachirKhiati/lexia/internal/models"
	"github.com/BachirKhiati/lexia/internal/services/ai"
)

type QuestHandler struct {
	db        *database.DB
	aiService *ai.Service
}

func NewQuestHandler(db *database.DB, aiService *ai.Service) *QuestHandler {
	return &QuestHandler{
		db:        db,
		aiService: aiService,
	}
}

// GetUserQuests returns all quests for a user
// @Summary Get user quests
// @Description Retrieve all quests for a specific user
// @Tags Quests
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param userID path int true "User ID"
// @Success 200 {array} models.Quest "List of quests"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Database error"
// @Router /users/{userID}/quests [get]
func (h *QuestHandler) GetUserQuests(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userID")

	rows, err := h.db.Query(`
		SELECT id, user_id, title, description, solution, difficulty, status, created_at, completed_at
		FROM quests
		WHERE user_id = $1
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var quests []models.Quest
	for rows.Next() {
		var q models.Quest
		if err := rows.Scan(&q.ID, &q.UserID, &q.Title, &q.Description, &q.Solution, &q.Difficulty, &q.Status, &q.CreatedAt, &q.CompletedAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		quests = append(quests, q)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quests)
}

// GenerateQuest creates a new AI-generated quest
// @Summary Generate new quest
// @Description Generate a new AI-powered writing quest using user's ghost words
// @Tags Quests
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param userID path int true "User ID"
// @Success 200 {object} models.Quest "Generated quest"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Quest generation failed"
// @Router /users/{userID}/quests/generate [post]
func (h *QuestHandler) GenerateQuest(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userID")
	userIDInt, _ := strconv.Atoi(userID)

	// Get user's ghost words
	rows, err := h.db.Query(`
		SELECT word FROM words
		WHERE user_id = $1 AND status = 'ghost'
		LIMIT 5
	`, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var ghostWords []string
	for rows.Next() {
		var word string
		if err := rows.Scan(&word); err == nil {
			ghostWords = append(ghostWords, word)
		}
	}

	// Generate quest using AI (Claude)
	questJSON, err := h.aiService.GenerateQuest(r.Context(), "beginner", "finnish", ghostWords)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Parse quest JSON
	var questData struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Solution    string `json:"solution"`
	}
	if err := json.Unmarshal([]byte(questJSON), &questData); err != nil {
		http.Error(w, "Failed to parse quest", http.StatusInternalServerError)
		return
	}

	// Save quest to database
	var quest models.Quest
	err = h.db.QueryRow(`
		INSERT INTO quests (user_id, title, description, solution, difficulty, status)
		VALUES ($1, $2, $3, $4, 'beginner', 'pending')
		RETURNING id, user_id, title, description, solution, difficulty, status, created_at, completed_at
	`, userIDInt, questData.Title, questData.Description, questData.Solution).Scan(
		&quest.ID, &quest.UserID, &quest.Title, &quest.Description, &quest.Solution, &quest.Difficulty, &quest.Status, &quest.CreatedAt, &quest.CompletedAt,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quest)
}

// ValidateQuest validates user's quest submission
// @Summary Validate quest submission
// @Description Validate user's written text for a quest using AI feedback
// @Tags Quests
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.QuestValidationRequest true "Quest validation data"
// @Success 200 {object} models.QuestValidationResponse "Validation result with feedback"
// @Failure 400 {object} map[string]string "Invalid request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "Quest not found"
// @Failure 500 {object} map[string]string "Validation failed"
// @Router /users/{userID}/quests/validate [post]
func (h *QuestHandler) ValidateQuest(w http.ResponseWriter, r *http.Request) {
	var req models.QuestValidationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Get quest details
	var quest models.Quest
	err := h.db.QueryRow(`
		SELECT id, title, description FROM quests WHERE id = $1
	`, req.QuestID).Scan(&quest.ID, &quest.Title, &quest.Description)
	if err != nil {
		http.Error(w, "Quest not found", http.StatusNotFound)
		return
	}

	// Validate with AI
	isValid, feedback, err := h.aiService.ValidateQuestSubmission(
		r.Context(),
		quest.Description,
		req.UserText,
		"finnish",
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// If valid, mark quest as completed
	if isValid {
		_, err = h.db.Exec(`
			UPDATE quests
			SET status = 'completed', completed_at = NOW()
			WHERE id = $1
		`, req.QuestID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	response := models.QuestValidationResponse{
		IsValid:  isValid,
		Feedback: feedback,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
