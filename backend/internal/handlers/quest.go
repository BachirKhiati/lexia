package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/BachirKhiati/synapse/internal/database"
	"github.com/BachirKhiati/synapse/internal/models"
	"github.com/BachirKhiati/synapse/internal/services/ai"
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
