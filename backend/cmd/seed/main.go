package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/BachirKhiati/lexia/internal/config"
	"github.com/BachirKhiati/lexia/internal/database"
	"github.com/BachirKhiati/lexia/internal/services/auth"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	fmt.Println("🌱 Starting database seeder...")

	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.NewPostgres(cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize schema first
	if err := db.InitSchema(); err != nil {
		log.Fatalf("Failed to initialize schema: %v", err)
	}

	ctx := context.Background()
	rand.Seed(time.Now().UnixNano())

	// Create auth service for password hashing
	authService := auth.NewService(cfg.Auth.JWTSecret, cfg.Auth.JWTIssuer)

	// Seed data
	if err := seedUsers(ctx, db, authService); err != nil {
		log.Fatalf("Failed to seed users: %v", err)
	}

	if err := seedWords(ctx, db); err != nil {
		log.Fatalf("Failed to seed words: %v", err)
	}

	if err := seedQuests(ctx, db); err != nil {
		log.Fatalf("Failed to seed quests: %v", err)
	}

	if err := seedProgress(ctx, db); err != nil {
		log.Fatalf("Failed to seed progress: %v", err)
	}

	fmt.Println("✅ Database seeding completed successfully!")
}

func seedUsers(ctx context.Context, db *database.DB, authService *auth.Service) error {
	fmt.Println("👤 Seeding users...")

	users := []struct {
		email    string
		username string
		password string
		language string
	}{
		{"demo@synapse.app", "demo_user", "Demo1234", "finnish"},
		{"alice@example.com", "alice", "Alice1234", "finnish"},
		{"bob@example.com", "bob", "Bob1234", "spanish"},
		{"carol@example.com", "carol", "Carol1234", "french"},
	}

	for _, user := range users {
		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.password), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("failed to hash password: %w", err)
		}

		// Check if user exists
		var exists bool
		err = db.QueryRow(`SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`, user.email).Scan(&exists)
		if err != nil {
			return fmt.Errorf("failed to check user existence: %w", err)
		}

		if exists {
			fmt.Printf("  ⏭️  User %s already exists, skipping\n", user.email)
			continue
		}

		// Insert user
		_, err = db.Exec(`
			INSERT INTO users (email, username, password_hash, language, created_at, updated_at)
			VALUES ($1, $2, $3, $4, NOW(), NOW())
		`, user.email, user.username, string(hashedPassword), user.language)

		if err != nil {
			return fmt.Errorf("failed to insert user %s: %w", user.email, err)
		}

		fmt.Printf("  ✅ Created user: %s (%s)\n", user.username, user.email)
	}

	return nil
}

func seedWords(ctx context.Context, db *database.DB) error {
	fmt.Println("📚 Seeding words...")

	// Get demo user ID
	var userID int
	err := db.QueryRow(`SELECT id FROM users WHERE email = 'demo@synapse.app'`).Scan(&userID)
	if err != nil {
		return fmt.Errorf("failed to get demo user: %w", err)
	}

	// Sample Finnish words with different statuses
	words := []struct {
		word         string
		definition   string
		partOfSpeech string
		status       string
		easeFactor   float64
		interval     int
		repetitions  int
	}{
		// Solid words (mastered)
		{"hei", "hello, hi", "interjection", "solid", 2.5, 30, 5},
		{"kiitos", "thank you, thanks", "interjection", "solid", 2.6, 45, 6},
		{"kyllä", "yes", "adverb", "solid", 2.5, 30, 5},
		{"ei", "no, not", "adverb", "solid", 2.4, 25, 5},
		{"hyvä", "good", "adjective", "solid", 2.5, 30, 5},
		{"päivä", "day", "noun", "solid", 2.3, 20, 4},
		{"vesi", "water", "noun", "solid", 2.5, 30, 5},
		{"ruoka", "food", "noun", "solid", 2.4, 25, 4},

		// Liquid words (learning)
		{"talo", "house", "noun", "liquid", 2.2, 7, 3},
		{"auto", "car", "noun", "liquid", 2.1, 5, 2},
		{"kirja", "book", "noun", "liquid", 2.3, 10, 3},
		{"koulu", "school", "noun", "liquid", 2.0, 3, 2},
		{"työ", "work, job", "noun", "liquid", 2.2, 7, 3},
		{"aika", "time", "noun", "liquid", 2.1, 5, 2},

		// Ghost words (new)
		{"opiskella", "to study", "verb", "ghost", 2.5, 0, 0},
		{"puhua", "to speak, to talk", "verb", "ghost", 2.5, 0, 0},
		{"syödä", "to eat", "verb", "ghost", 2.5, 0, 0},
		{"juoda", "to drink", "verb", "ghost", 2.5, 0, 0},
		{"nähdä", "to see", "verb", "ghost", 2.5, 0, 0},
		{"kuulla", "to hear", "verb", "ghost", 2.5, 0, 0},
		{"ystävä", "friend", "noun", "ghost", 2.5, 0, 0},
		{"perhe", "family", "noun", "ghost", 2.5, 0, 0},
	}

	for _, word := range words {
		// Check if word exists
		var exists bool
		err = db.QueryRow(`SELECT EXISTS(SELECT 1 FROM words WHERE user_id = $1 AND word = $2)`, userID, word.word).Scan(&exists)
		if err != nil {
			return fmt.Errorf("failed to check word existence: %w", err)
		}

		if exists {
			continue
		}

		// Calculate next review date
		var nextReviewAt *time.Time
		if word.status != "ghost" && word.interval > 0 {
			reviewDate := time.Now().Add(time.Duration(word.interval) * 24 * time.Hour)
			nextReviewAt = &reviewDate
		}

		// Insert word
		_, err = db.Exec(`
			INSERT INTO words (
				user_id, word, definition, part_of_speech, status,
				ease_factor, interval_days, repetition_count,
				next_review_at, added_at, updated_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
		`, userID, word.word, word.definition, word.partOfSpeech, word.status,
			word.easeFactor, word.interval, word.repetitions, nextReviewAt)

		if err != nil {
			return fmt.Errorf("failed to insert word %s: %w", word.word, err)
		}
	}

	fmt.Printf("  ✅ Created %d words with mixed statuses\n", len(words))
	return nil
}

func seedQuests(ctx context.Context, db *database.DB) error {
	fmt.Println("✍️  Seeding quests...")

	// Get demo user ID
	var userID int
	err := db.QueryRow(`SELECT id FROM users WHERE email = 'demo@synapse.app'`).Scan(&userID)
	if err != nil {
		return fmt.Errorf("failed to get demo user: %w", err)
	}

	// Sample quests
	quests := []struct {
		title       string
		description string
		status      string
		targetWords []string
		completed   bool
	}{
		{
			title:       "Introduce Yourself",
			description: "Write a short paragraph introducing yourself in Finnish. Include your name, where you're from, and what you like to do.",
			status:      "completed",
			targetWords: []string{"hei", "olen", "tykkään"},
			completed:   true,
		},
		{
			title:       "Daily Routine",
			description: "Describe your typical daily routine using at least 5 sentences. Use time expressions and daily activities.",
			status:      "completed",
			targetWords: []string{"aamu", "päivä", "ilta", "syödä", "nukkua"},
			completed:   true,
		},
		{
			title:       "Shopping Trip",
			description: "Write about a shopping trip. Describe what you bought and why. Use at least 3 of your ghost words.",
			status:      "in_progress",
			targetWords: []string{"kauppa", "ostaa", "ruoka", "hinta"},
			completed:   false,
		},
		{
			title:       "Weekend Plans",
			description: "Write about your plans for the upcoming weekend. Use future tense and include activities with friends or family.",
			status:      "pending",
			targetWords: []string{"viikonloppu", "ystävä", "perhe", "tehdä"},
			completed:   false,
		},
	}

	for i, quest := range quests {
		// Check if quest exists
		var exists bool
		err = db.QueryRow(`SELECT EXISTS(SELECT 1 FROM quests WHERE user_id = $1 AND title = $2)`, userID, quest.title).Scan(&exists)
		if err != nil {
			return fmt.Errorf("failed to check quest existence: %w", err)
		}

		if exists {
			continue
		}

		// Generate target words JSON
		targetWordsJSON := "[]"
		if len(quest.targetWords) > 0 {
			targetWordsJSON = fmt.Sprintf(`["%s"]`, quest.targetWords[0])
			for _, word := range quest.targetWords[1:] {
				targetWordsJSON = targetWordsJSON[:len(targetWordsJSON)-1] + fmt.Sprintf(`, "%s"]`, word)
			}
		}

		var completedAt *time.Time
		if quest.completed {
			completed := time.Now().Add(-time.Duration(i*2) * 24 * time.Hour)
			completedAt = &completed
		}

		// Insert quest
		_, err = db.Exec(`
			INSERT INTO quests (
				user_id, title, description, status,
				target_words, created_at, updated_at, completed_at
			) VALUES ($1, $2, $3, $4, $5::jsonb, NOW(), NOW(), $6)
		`, userID, quest.title, quest.description, quest.status, targetWordsJSON, completedAt)

		if err != nil {
			return fmt.Errorf("failed to insert quest %s: %w", quest.title, err)
		}
	}

	fmt.Printf("  ✅ Created %d quests with various statuses\n", len(quests))
	return nil
}

func seedProgress(ctx context.Context, db *database.DB) error {
	fmt.Println("📈 Seeding progress data...")

	// Get demo user ID
	var userID int
	err := db.QueryRow(`SELECT id FROM users WHERE email = 'demo@synapse.app'`).Scan(&userID)
	if err != nil {
		return fmt.Errorf("failed to get demo user: %w", err)
	}

	// Check if progress exists
	var exists bool
	err = db.QueryRow(`SELECT EXISTS(SELECT 1 FROM user_progress WHERE user_id = $1)`, userID).Scan(&exists)
	if err != nil {
		return fmt.Errorf("failed to check progress existence: %w", err)
	}

	if exists {
		fmt.Println("  ⏭️  Progress already exists, skipping")
		return nil
	}

	// Create progress
	streakDays := 7 + rand.Intn(7) // 7-14 days
	_, err = db.Exec(`
		INSERT INTO user_progress (
			user_id, streak_days, last_activity_date, created_at, updated_at
		) VALUES ($1, $2, NOW(), NOW(), NOW())
	`, userID, streakDays)

	if err != nil {
		return fmt.Errorf("failed to insert progress: %w", err)
	}

	fmt.Printf("  ✅ Created progress data with %d day streak\n", streakDays)
	return nil
}
