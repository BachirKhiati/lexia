package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/BachirKhiati/synapse/internal/config"
	"github.com/BachirKhiati/synapse/internal/database"
	"github.com/BachirKhiati/synapse/internal/handlers"
	"github.com/BachirKhiati/synapse/internal/services/ai"
	"github.com/BachirKhiati/synapse/internal/services/language"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.NewPostgres(cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize database schema
	if err := db.InitSchema(); err != nil {
		log.Fatalf("Failed to initialize schema: %v", err)
	}

	// Initialize AI service (Claude + Gemini)
	aiService, err := ai.NewService(
		cfg.AI.ClaudeAPIKey,
		cfg.AI.GeminiAPIKey,
		cfg.AI.DefaultProvider,
	)
	if err != nil {
		log.Fatalf("Failed to initialize AI service: %v", err)
	}

	// Initialize language service
	langService := language.NewService()

	// Initialize handlers
	analyzerHandler := handlers.NewAnalyzerHandler(aiService, langService)
	questHandler := handlers.NewQuestHandler(db, aiService)
	synapseHandler := handlers.NewSynapseHandler(db)

	// Setup router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.CORS.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// API routes
	r.Route("/api/v1", func(r chi.Router) {
		// The Analyzer - Universal word analysis
		r.Post("/analyze", analyzerHandler.AnalyzeWord)

		// The Scribe - Quest system
		r.Route("/users/{userID}/quests", func(r chi.Router) {
			r.Get("/", questHandler.GetUserQuests)
			r.Post("/generate", questHandler.GenerateQuest)
			r.Post("/validate", questHandler.ValidateQuest)
		})

		// The Synapse - Mind map
		r.Route("/users/{userID}/synapse", func(r chi.Router) {
			r.Get("/", synapseHandler.GetMindMap)
			r.Post("/words", synapseHandler.AddWord)
		})

		// The Lens - Content importer (TODO)
		// The Orator - Speaking coach (TODO)
	})

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("🚀 Synapse server starting on %s", addr)
	log.Printf("📚 Learning language: %s", cfg.Language.DefaultLanguage)
	log.Printf("🤖 AI Provider: %s", cfg.AI.DefaultProvider)

	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
