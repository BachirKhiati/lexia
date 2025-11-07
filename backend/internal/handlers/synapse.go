package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/BachirKhiati/synapse/internal/database"
	"github.com/BachirKhiati/synapse/internal/models"
)

type SynapseHandler struct {
	db *database.DB
}

func NewSynapseHandler(db *database.DB) *SynapseHandler {
	return &SynapseHandler{db: db}
}

// GetMindMap returns the user's complete knowledge graph
func (h *SynapseHandler) GetMindMap(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userID")

	// Get all words (nodes)
	rows, err := h.db.Query(`
		SELECT id, word, status, part_of_speech
		FROM words
		WHERE user_id = $1
	`, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var nodes []models.MindMapNode
	for rows.Next() {
		var node models.MindMapNode
		var partOfSpeech sql.NullString
		if err := rows.Scan(&node.ID, &node.Word, &node.Status, &partOfSpeech); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if partOfSpeech.Valid {
			node.Category = partOfSpeech.String
		} else {
			node.Category = "vocabulary"
		}
		nodes = append(nodes, node)
	}

	// Get all relations (links)
	linkRows, err := h.db.Query(`
		SELECT source_word_id, target_word_id, relation_type
		FROM word_relations
		WHERE user_id = $1
	`, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer linkRows.Close()

	var links []models.MindMapLink
	for linkRows.Next() {
		var link models.MindMapLink
		if err := linkRows.Scan(&link.Source, &link.Target, &link.RelationType); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		links = append(links, link)
	}

	mindMap := models.MindMapData{
		Nodes: nodes,
		Links: links,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(mindMap)
}

// AddWord adds a word to the user's Synapse
func (h *SynapseHandler) AddWord(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userID")

	var req struct {
		Word         string   `json:"word"`
		Lemma        string   `json:"lemma"`
		Definition   string   `json:"definition"`
		PartOfSpeech string   `json:"part_of_speech"`
		Examples     []string `json:"examples"`
		Language     string   `json:"language"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Insert word as "ghost" status
	var wordID int
	err := h.db.QueryRow(`
		INSERT INTO words (user_id, word, lemma, definition, part_of_speech, examples, language, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'ghost')
		RETURNING id
	`, userID, req.Word, req.Lemma, req.Definition, req.PartOfSpeech, req.Examples, req.Language).Scan(&wordID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":     wordID,
		"status": "ghost",
	})
}
