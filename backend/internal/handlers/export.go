package handlers

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/BachirKhiati/synapse/internal/database"
	"github.com/BachirKhiati/synapse/internal/services/auth"
)

type ExportHandler struct {
	db *database.DB
}

func NewExportHandler(db *database.DB) *ExportHandler {
	return &ExportHandler{db: db}
}

// ExportData represents the complete user data export
type ExportData struct {
	User      UserExport      `json:"user"`
	Words     []WordExport    `json:"words"`
	Quests    []QuestExport   `json:"quests"`
	Progress  ProgressExport  `json:"progress"`
	ExportedAt time.Time      `json:"exported_at"`
	Version   string          `json:"version"`
}

type UserExport struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Language string `json:"language"`
}

type WordExport struct {
	Word            string    `json:"word"`
	Definition      string    `json:"definition"`
	PartOfSpeech    string    `json:"part_of_speech"`
	Status          string    `json:"status"`
	EaseFactor      float64   `json:"ease_factor"`
	IntervalDays    int       `json:"interval_days"`
	RepetitionCount int       `json:"repetition_count"`
	NextReviewAt    *time.Time `json:"next_review_at"`
	AddedAt         time.Time `json:"added_at"`
}

type QuestExport struct {
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	TargetWords []string  `json:"target_words"`
	CreatedAt   time.Time `json:"created_at"`
	CompletedAt *time.Time `json:"completed_at"`
}

type ProgressExport struct {
	StreakDays       int       `json:"streak_days"`
	LastActivityDate time.Time `json:"last_activity_date"`
}

// ExportJSON exports all user data as JSON
// @Summary Export user data as JSON
// @Description Exports all user vocabulary, quests, and progress as JSON
// @Tags Export
// @Security BearerAuth
// @Produce json
// @Success 200 {object} ExportData "User data export"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Router /export/json [get]
func (h *ExportHandler) ExportJSON(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	data, err := h.getUserData(claims.UserID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to export data: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=synapse-export-%s.json", time.Now().Format("20060102-150405")))

	json.NewEncoder(w).Encode(data)
}

// ExportCSV exports vocabulary as CSV
// @Summary Export vocabulary as CSV
// @Description Exports user vocabulary as CSV file
// @Tags Export
// @Security BearerAuth
// @Produce text/csv
// @Success 200 {string} string "CSV data"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Router /export/csv [get]
func (h *ExportHandler) ExportCSV(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	data, err := h.getUserData(claims.UserID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to export data: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=synapse-vocabulary-%s.csv", time.Now().Format("20060102-150405")))

	writer := csv.NewWriter(w)
	defer writer.Flush()

	// Write header
	writer.Write([]string{"Word", "Definition", "Part of Speech", "Status", "Ease Factor", "Interval Days", "Repetitions", "Next Review", "Added Date"})

	// Write words
	for _, word := range data.Words {
		nextReview := ""
		if word.NextReviewAt != nil {
			nextReview = word.NextReviewAt.Format("2006-01-02")
		}

		writer.Write([]string{
			word.Word,
			word.Definition,
			word.PartOfSpeech,
			word.Status,
			fmt.Sprintf("%.2f", word.EaseFactor),
			fmt.Sprintf("%d", word.IntervalDays),
			fmt.Sprintf("%d", word.RepetitionCount),
			nextReview,
			word.AddedAt.Format("2006-01-02"),
		})
	}
}

// ImportCSV imports vocabulary from CSV
// @Summary Import vocabulary from CSV
// @Description Imports vocabulary from CSV file (supports standard format)
// @Tags Import
// @Security BearerAuth
// @Accept multipart/form-data
// @Param file formData file true "CSV file"
// @Produce json
// @Success 200 {object} map[string]interface{} "Import results"
// @Failure 400 {object} map[string]string "Bad request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Router /import/csv [post]
func (h *ExportHandler) ImportCSV(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Parse multipart form
	err := r.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to get file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Parse CSV
	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		http.Error(w, "Failed to parse CSV", http.StatusBadRequest)
		return
	}

	if len(records) < 2 {
		http.Error(w, "CSV file is empty or has no data rows", http.StatusBadRequest)
		return
	}

	// Skip header row
	records = records[1:]

	imported := 0
	skipped := 0
	errors := []string{}

	for i, record := range records {
		if len(record) < 3 {
			errors = append(errors, fmt.Sprintf("Row %d: insufficient columns", i+2))
			skipped++
			continue
		}

		word := record[0]
		definition := record[1]
		partOfSpeech := record[2]

		// Check if word already exists
		var exists bool
		err = h.db.QueryRow(`
			SELECT EXISTS(SELECT 1 FROM words WHERE user_id = $1 AND word = $2)
		`, claims.UserID, word).Scan(&exists)

		if err != nil {
			errors = append(errors, fmt.Sprintf("Row %d: database error", i+2))
			skipped++
			continue
		}

		if exists {
			skipped++
			continue
		}

		// Insert new word
		_, err = h.db.Exec(`
			INSERT INTO words (user_id, word, definition, part_of_speech, status, ease_factor, interval_days, repetition_count, added_at, updated_at)
			VALUES ($1, $2, $3, $4, 'ghost', 2.5, 0, 0, NOW(), NOW())
		`, claims.UserID, word, definition, partOfSpeech)

		if err != nil {
			errors = append(errors, fmt.Sprintf("Row %d: insert failed", i+2))
			skipped++
			continue
		}

		imported++
	}

	result := map[string]interface{}{
		"imported": imported,
		"skipped":  skipped,
		"errors":   errors,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// ImportJSON imports user data from JSON export
// @Summary Import user data from JSON
// @Description Imports vocabulary and quests from JSON export file
// @Tags Import
// @Security BearerAuth
// @Accept multipart/form-data
// @Param file formData file true "JSON export file"
// @Produce json
// @Success 200 {object} map[string]interface{} "Import results"
// @Failure 400 {object} map[string]string "Bad request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Router /import/json [post]
func (h *ExportHandler) ImportJSON(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Parse multipart form
	err := r.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to get file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Parse JSON
	var exportData ExportData
	if err := json.NewDecoder(file).Decode(&exportData); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	wordsImported := 0
	wordsSkipped := 0
	questsImported := 0
	questsSkipped := 0

	// Import words
	for _, word := range exportData.Words {
		var exists bool
		err = h.db.QueryRow(`
			SELECT EXISTS(SELECT 1 FROM words WHERE user_id = $1 AND word = $2)
		`, claims.UserID, word.Word).Scan(&exists)

		if exists {
			wordsSkipped++
			continue
		}

		_, err = h.db.Exec(`
			INSERT INTO words (user_id, word, definition, part_of_speech, status, ease_factor, interval_days, repetition_count, next_review_at, added_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
		`, claims.UserID, word.Word, word.Definition, word.PartOfSpeech, word.Status,
		   word.EaseFactor, word.IntervalDays, word.RepetitionCount, word.NextReviewAt, word.AddedAt)

		if err != nil {
			wordsSkipped++
			continue
		}

		wordsImported++
	}

	// Import quests
	for _, quest := range exportData.Quests {
		var exists bool
		err = h.db.QueryRow(`
			SELECT EXISTS(SELECT 1 FROM quests WHERE user_id = $1 AND title = $2)
		`, claims.UserID, quest.Title).Scan(&exists)

		if exists {
			questsSkipped++
			continue
		}

		targetWordsJSON, _ := json.Marshal(quest.TargetWords)
		_, err = h.db.Exec(`
			INSERT INTO quests (user_id, title, description, status, target_words, created_at, updated_at, completed_at)
			VALUES ($1, $2, $3, $4, $5::jsonb, $6, NOW(), $7)
		`, claims.UserID, quest.Title, quest.Description, quest.Status, targetWordsJSON, quest.CreatedAt, quest.CompletedAt)

		if err != nil {
			questsSkipped++
			continue
		}

		questsImported++
	}

	result := map[string]interface{}{
		"words_imported":  wordsImported,
		"words_skipped":   wordsSkipped,
		"quests_imported": questsImported,
		"quests_skipped":  questsSkipped,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// Helper function to get all user data
func (h *ExportHandler) getUserData(userID int) (*ExportData, error) {
	data := &ExportData{
		Version:    "1.0",
		ExportedAt: time.Now(),
	}

	// Get user info
	err := h.db.QueryRow(`
		SELECT email, username, language FROM users WHERE id = $1
	`, userID).Scan(&data.User.Email, &data.User.Username, &data.User.Language)
	if err != nil {
		return nil, err
	}

	// Get words
	rows, err := h.db.Query(`
		SELECT word, definition, part_of_speech, status, ease_factor, interval_days, repetition_count, next_review_at, added_at
		FROM words WHERE user_id = $1 ORDER BY added_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var word WordExport
		err := rows.Scan(&word.Word, &word.Definition, &word.PartOfSpeech, &word.Status,
			&word.EaseFactor, &word.IntervalDays, &word.RepetitionCount, &word.NextReviewAt, &word.AddedAt)
		if err != nil {
			continue
		}
		data.Words = append(data.Words, word)
	}

	// Get quests
	rows, err = h.db.Query(`
		SELECT title, description, status, target_words, created_at, completed_at
		FROM quests WHERE user_id = $1 ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var quest QuestExport
		var targetWordsJSON []byte
		err := rows.Scan(&quest.Title, &quest.Description, &quest.Status, &targetWordsJSON, &quest.CreatedAt, &quest.CompletedAt)
		if err != nil {
			continue
		}
		json.Unmarshal(targetWordsJSON, &quest.TargetWords)
		data.Quests = append(data.Quests, quest)
	}

	// Get progress
	err = h.db.QueryRow(`
		SELECT streak_days, last_activity_date FROM user_progress WHERE user_id = $1
	`, userID).Scan(&data.Progress.StreakDays, &data.Progress.LastActivityDate)
	if err != nil {
		// Progress might not exist, that's okay
		data.Progress.StreakDays = 0
		data.Progress.LastActivityDate = time.Now()
	}

	return data, nil
}
