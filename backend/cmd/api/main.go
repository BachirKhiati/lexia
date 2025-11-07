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
	"github.com/BachirKhiati/synapse/internal/middleware"
	"github.com/BachirKhiati/synapse/internal/services/ai"
	"github.com/BachirKhiati/synapse/internal/services/auth"
	"github.com/BachirKhiati/synapse/internal/services/language"
	"github.com/BachirKhiati/synapse/internal/services/scraper"
	"github.com/BachirKhiati/synapse/internal/services/srs"
	"github.com/BachirKhiati/synapse/internal/services/wiktionary"
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

	// Initialize auth service
	authService := auth.NewService(cfg.Auth.JWTSecret, cfg.Auth.JWTIssuer)

	// Initialize wiktionary service
	wiktionaryService := wiktionary.NewService()

	// Initialize language service
	langService := language.NewService(wiktionaryService)

	// Initialize scraper service
	scraperService := scraper.NewService()

	// Initialize SRS service
	srsService := srs.NewService()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(db, authService)
	analyzerHandler := handlers.NewAnalyzerHandler(aiService, langService)
	questHandler := handlers.NewQuestHandler(db, aiService)
	synapseHandler := handlers.NewSynapseHandler(db)
	lensHandler := handlers.NewLensHandler(db, scraperService)
	userHandler := handlers.NewUserHandler(db)
	srsHandler := handlers.NewSRSHandler(db, srsService)

	// Setup router
	r := chi.NewRouter()

	// Global middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.SecurityHeaders)
	r.Use(middleware.RequestSizeLimit(10 * 1024 * 1024)) // 10MB max request size
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.CORS.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Rate limiters
	standardLimit := middleware.StandardRateLimit()
	strictLimit := middleware.StrictRateLimit()
	generousLimit := middleware.GenerousRateLimit()

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// API routes
	r.Route("/api/v1", func(r chi.Router) {
		// Public routes (no authentication required) - strict rate limiting
		r.Group(func(r chi.Router) {
			r.Use(strictLimit.Limit)
			r.Use(middleware.ValidateContentType("application/json"))
			r.Post("/auth/register", authHandler.Register)
			r.Post("/auth/login", authHandler.Login)
		})

		// Protected routes (authentication required)
		r.Group(func(r chi.Router) {
			r.Use(middleware.Auth(authService))
			r.Use(standardLimit.Limit)

			// Auth endpoints
			r.Get("/auth/me", authHandler.Me)
			r.Post("/auth/refresh", authHandler.RefreshToken)

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

			// The Lens - Content importer
			r.Post("/lens/import", lensHandler.ImportArticle)
			r.Get("/lens/articles", lensHandler.GetUserArticles)

			// User progress
			r.Get("/users/progress", userHandler.GetProgress)

			// Spaced Repetition System
			r.Get("/srs/due", srsHandler.GetDueWords)
			r.Post("/srs/review", srsHandler.SubmitReview)

			// The Orator - Speaking coach (completed)
		})
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
