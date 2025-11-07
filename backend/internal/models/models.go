package models

import (
	"time"
)

// User represents a language learner
type User struct {
	ID        int       `json:"id"`
	Email     string    `json:"email"`
	Username  string    `json:"username"`
	Language  string    `json:"language"` // Target language (e.g., "finnish")
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Quest represents a language learning challenge/task
type Quest struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Solution    string    `json:"solution"` // The "Glimpse Solution"
	Difficulty  string    `json:"difficulty"` // beginner, intermediate, advanced
	Status      string    `json:"status"` // pending, in_progress, completed
	CreatedAt   time.Time `json:"created_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
}

// Word represents a vocabulary item in the knowledge graph
type Word struct {
	ID           int       `json:"id"`
	UserID       int       `json:"user_id"`
	Word         string    `json:"word"`
	Lemma        string    `json:"lemma"` // Root form
	Language     string    `json:"language"`
	Definition   string    `json:"definition"`
	PartOfSpeech string    `json:"part_of_speech"` // noun, verb, adjective, etc.
	Examples     []string  `json:"examples"`
	Status       string    `json:"status"` // ghost (discovered), solid (mastered)
	AddedAt      time.Time `json:"added_at"`
	MasteredAt   *time.Time `json:"mastered_at,omitempty"`
}

// WordConjugation stores verb conjugations (critical for Finnish!)
type WordConjugation struct {
	ID       int    `json:"id"`
	WordID   int    `json:"word_id"`
	Tense    string `json:"tense"` // present, past, perfect, etc.
	Person   string `json:"person"` // 1sg, 2sg, 3sg, 1pl, 2pl, 3pl
	Form     string `json:"form"` // The conjugated form
	Language string `json:"language"`
}

// WordRelation represents connections in the mind map
type WordRelation struct {
	ID           int       `json:"id"`
	UserID       int       `json:"user_id"`
	SourceWordID int       `json:"source_word_id"`
	TargetWordID int       `json:"target_word_id"`
	RelationType string    `json:"relation_type"` // synonym, antonym, conjugation, grammar_rule, etc.
	CreatedAt    time.Time `json:"created_at"`
}

// Article represents imported content from The Lens
type Article struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Title     string    `json:"title"`
	URL       string    `json:"url,omitempty"`
	Content   string    `json:"content"` // Cleaned text
	Language  string    `json:"language"`
	AddedAt   time.Time `json:"added_at"`
}

// UserProgress tracks learning statistics
type UserProgress struct {
	ID              int       `json:"id"`
	UserID          int       `json:"user_id"`
	WordsMastered   int       `json:"words_mastered"`
	QuestsCompleted int       `json:"quests_completed"`
	StreakDays      int       `json:"streak_days"`
	LastActiveAt    time.Time `json:"last_active_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// AnalyzerRequest is the request payload for the Analyzer pop-up
type AnalyzerRequest struct {
	Word     string `json:"word"`
	Language string `json:"language"`
	Context  string `json:"context,omitempty"` // Optional sentence context
}

// AnalyzerResponse is what the Analyzer returns
type AnalyzerResponse struct {
	Word         string              `json:"word"`
	Lemma        string              `json:"lemma"`
	Definition   string              `json:"definition"`
	PartOfSpeech string              `json:"part_of_speech"`
	Examples     []string            `json:"examples"`
	Conjugations []WordConjugation   `json:"conjugations,omitempty"`
	AudioURL     string              `json:"audio_url,omitempty"`
	InSynapse    bool                `json:"in_synapse"` // Is this word already in user's mind map?
}

// QuestValidationRequest validates user's quest submission
type QuestValidationRequest struct {
	QuestID  int    `json:"quest_id"`
	UserText string `json:"user_text"`
}

// QuestValidationResponse provides AI feedback
type QuestValidationResponse struct {
	IsValid  bool     `json:"is_valid"`
	Feedback string   `json:"feedback"` // Socratic guidance
	NewWords []string `json:"new_words,omitempty"` // Words used correctly for first time
}

// MindMapNode represents a node in the d3.js visualization
type MindMapNode struct {
	ID       int    `json:"id"`
	Word     string `json:"word"`
	Status   string `json:"status"` // ghost or solid
	Category string `json:"category"` // grammar, vocabulary, etc.
	X        float64 `json:"x,omitempty"`
	Y        float64 `json:"y,omitempty"`
}

// MindMapLink represents an edge in the knowledge graph
type MindMapLink struct {
	Source       int    `json:"source"`
	Target       int    `json:"target"`
	RelationType string `json:"relation_type"`
}

// MindMapData is the complete graph data for The Synapse
type MindMapData struct {
	Nodes []MindMapNode `json:"nodes"`
	Links []MindMapLink `json:"links"`
}
