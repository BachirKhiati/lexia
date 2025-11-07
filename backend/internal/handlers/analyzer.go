package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/BachirKhiati/synapse/internal/models"
	"github.com/BachirKhiati/synapse/internal/services/ai"
	"github.com/BachirKhiati/synapse/internal/services/language"
)

type AnalyzerHandler struct {
	aiService       *ai.Service
	languageService *language.Service
}

func NewAnalyzerHandler(aiService *ai.Service, langService *language.Service) *AnalyzerHandler {
	return &AnalyzerHandler{
		aiService:       aiService,
		languageService: langService,
	}
}

// AnalyzeWord handles the universal pop-up analyzer requests
// @Summary Analyze a word
// @Description Get comprehensive analysis of a word including definition, part of speech, examples, and conjugations
// @Tags Analyzer
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.AnalyzerRequest true "Word to analyze"
// @Success 200 {object} models.AnalyzerResponse "Word analysis"
// @Failure 400 {object} map[string]string "Invalid request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Analysis failed"
// @Router /analyze [post]
func (h *AnalyzerHandler) AnalyzeWord(w http.ResponseWriter, r *http.Request) {
	var req models.AnalyzerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Get word analysis from language service
	analysis, err := h.languageService.AnalyzeWord(r.Context(), req.Word, req.Language)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// TODO: Check if word is already in user's Synapse
	analysis.InSynapse = false

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(analysis)
}
