package ai

import (
	"context"
	"fmt"
)

// AIProvider is the interface that all AI providers must implement
type AIProvider interface {
	GenerateQuest(ctx context.Context, userLevel string, language string, ghostWords []string) (string, error)
	ValidateQuestSubmission(ctx context.Context, quest string, userText string, language string) (bool, string, error)
	GenerateSocraticFeedback(ctx context.Context, userText string, language string) (string, error)
	Translate(ctx context.Context, text string, fromLang string, toLang string) (string, error)
	AnalyzeGrammar(ctx context.Context, text string, language string) (map[string]interface{}, error)
	GetWordDefinition(ctx context.Context, word string, language string) (definition string, partOfSpeech string, examples []string, err error)
}

// Service manages multiple AI providers
type Service struct {
	claude          *ClaudeProvider
	gemini          *GeminiProvider
	defaultProvider string
}

// NewService creates a new multi-provider AI service
func NewService(claudeAPIKey, geminiAPIKey, defaultProvider string) (*Service, error) {
	var claude *ClaudeProvider
	var gemini *GeminiProvider
	var err error

	if claudeAPIKey != "" {
		claude, err = NewClaudeProvider(claudeAPIKey)
		if err != nil {
			return nil, fmt.Errorf("failed to initialize Claude: %w", err)
		}
	}

	if geminiAPIKey != "" {
		gemini, err = NewGeminiProvider(geminiAPIKey)
		if err != nil {
			return nil, fmt.Errorf("failed to initialize Gemini: %w", err)
		}
	}

	if claude == nil && gemini == nil {
		return nil, fmt.Errorf("at least one AI provider must be configured")
	}

	return &Service{
		claude:          claude,
		gemini:          gemini,
		defaultProvider: defaultProvider,
	}, nil
}

// GetProvider returns the specified provider or default
func (s *Service) GetProvider(name string) (AIProvider, error) {
	if name == "" {
		name = s.defaultProvider
	}

	switch name {
	case "claude":
		if s.claude == nil {
			return nil, fmt.Errorf("Claude provider not configured")
		}
		return s.claude, nil
	case "gemini":
		if s.gemini == nil {
			return nil, fmt.Errorf("Gemini provider not configured")
		}
		return s.gemini, nil
	default:
		return nil, fmt.Errorf("unknown provider: %s", name)
	}
}

// GenerateQuest uses Claude (best for creative, Socratic teaching)
func (s *Service) GenerateQuest(ctx context.Context, userLevel string, language string, ghostWords []string) (string, error) {
	provider, err := s.GetProvider("claude")
	if err != nil {
		// Fallback to Gemini
		provider, err = s.GetProvider("gemini")
		if err != nil {
			return "", err
		}
	}
	return provider.GenerateQuest(ctx, userLevel, language, ghostWords)
}

// ValidateQuestSubmission uses Claude (best for nuanced feedback)
func (s *Service) ValidateQuestSubmission(ctx context.Context, quest string, userText string, language string) (bool, string, error) {
	provider, err := s.GetProvider("claude")
	if err != nil {
		provider, err = s.GetProvider("gemini")
		if err != nil {
			return false, "", err
		}
	}
	return provider.ValidateQuestSubmission(ctx, quest, userText, language)
}

// Translate uses Gemini (faster, cheaper for simple translations)
func (s *Service) Translate(ctx context.Context, text string, fromLang string, toLang string) (string, error) {
	provider, err := s.GetProvider("gemini")
	if err != nil {
		// Fallback to Claude
		provider, err = s.GetProvider("claude")
		if err != nil {
			return "", err
		}
	}
	return provider.Translate(ctx, text, fromLang, toLang)
}

// AnalyzeGrammar uses Gemini (good for structured analysis)
func (s *Service) AnalyzeGrammar(ctx context.Context, text string, language string) (map[string]interface{}, error) {
	provider, err := s.GetProvider("gemini")
	if err != nil {
		provider, err = s.GetProvider("claude")
		if err != nil {
			return nil, err
		}
	}
	return provider.AnalyzeGrammar(ctx, text, language)
}

// GetWordDefinition uses Gemini (fast and good for dictionary lookups)
func (s *Service) GetWordDefinition(ctx context.Context, word string, language string) (definition string, partOfSpeech string, examples []string, err error) {
	provider, err := s.GetProvider("gemini")
	if err != nil {
		// Fallback to Claude
		provider, err = s.GetProvider("claude")
		if err != nil {
			return "", "", nil, err
		}
	}
	return provider.GetWordDefinition(ctx, word, language)
}
