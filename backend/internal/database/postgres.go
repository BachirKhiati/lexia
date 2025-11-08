package database

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
	"github.com/BachirKhiati/lexia/internal/config"
)

type DB struct {
	*sql.DB
}

func NewPostgres(cfg config.DatabaseConfig) (*DB, error) {
	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Name,
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Configure connection pool for optimal performance
	db.SetMaxOpenConns(25)                 // Maximum number of open connections
	db.SetMaxIdleConns(25)                 // Maximum number of idle connections
	db.SetConnMaxLifetime(5 * time.Minute) // Maximum lifetime of a connection

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &DB{db}, nil
}

func (db *DB) InitSchema() error {
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		email VARCHAR(255) UNIQUE NOT NULL,
		username VARCHAR(100) UNIQUE NOT NULL,
		password_hash VARCHAR(255) NOT NULL,
		language VARCHAR(50) NOT NULL DEFAULT 'finnish',
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS quests (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		title VARCHAR(255) NOT NULL,
		description TEXT NOT NULL,
		solution TEXT NOT NULL,
		difficulty VARCHAR(50) NOT NULL DEFAULT 'beginner',
		status VARCHAR(50) NOT NULL DEFAULT 'pending',
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		completed_at TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS words (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		word VARCHAR(255) NOT NULL,
		lemma VARCHAR(255) NOT NULL,
		language VARCHAR(50) NOT NULL,
		definition TEXT NOT NULL,
		part_of_speech VARCHAR(50),
		examples TEXT[], -- Array of example sentences
		status VARCHAR(50) NOT NULL DEFAULT 'ghost',
		added_at TIMESTAMP NOT NULL DEFAULT NOW(),
		mastered_at TIMESTAMP,
		-- Spaced Repetition System fields
		ease_factor FLOAT NOT NULL DEFAULT 2.5,
		repetition_count INTEGER NOT NULL DEFAULT 0,
		interval INTEGER NOT NULL DEFAULT 0, -- days
		next_review_at TIMESTAMP,
		last_reviewed_at TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS word_conjugations (
		id SERIAL PRIMARY KEY,
		word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
		tense VARCHAR(50) NOT NULL,
		person VARCHAR(10) NOT NULL,
		form VARCHAR(255) NOT NULL,
		language VARCHAR(50) NOT NULL
	);

	CREATE TABLE IF NOT EXISTS word_relations (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		source_word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
		target_word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
		relation_type VARCHAR(50) NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS articles (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		title VARCHAR(500) NOT NULL,
		url TEXT,
		content TEXT NOT NULL,
		language VARCHAR(50) NOT NULL,
		added_at TIMESTAMP NOT NULL DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS user_progress (
		id SERIAL PRIMARY KEY,
		user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		words_mastered INTEGER NOT NULL DEFAULT 0,
		quests_completed INTEGER NOT NULL DEFAULT 0,
		streak_days INTEGER NOT NULL DEFAULT 0,
		last_active_at TIMESTAMP NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMP NOT NULL DEFAULT NOW()
	);

	-- Indexes for performance
	CREATE INDEX IF NOT EXISTS idx_words_user_id ON words(user_id);
	CREATE INDEX IF NOT EXISTS idx_words_status ON words(status);
	CREATE INDEX IF NOT EXISTS idx_words_user_status ON words(user_id, status);
	CREATE INDEX IF NOT EXISTS idx_words_next_review ON words(user_id, next_review_at) WHERE next_review_at IS NOT NULL;
	CREATE INDEX IF NOT EXISTS idx_quests_user_id ON quests(user_id);
	CREATE INDEX IF NOT EXISTS idx_quests_status ON quests(status);
	CREATE INDEX IF NOT EXISTS idx_quests_user_status ON quests(user_id, status);
	CREATE INDEX IF NOT EXISTS idx_word_relations_user_id ON word_relations(user_id);
	CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
	CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
	`

	_, err := db.Exec(schema)
	return err
}
