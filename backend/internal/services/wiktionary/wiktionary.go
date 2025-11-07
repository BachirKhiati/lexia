package wiktionary

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// Service handles Wiktionary API requests
type Service struct {
	client  *http.Client
	baseURL string
}

// Definition represents a word definition from Wiktionary
type Definition struct {
	PartOfSpeech string   `json:"partOfSpeech"`
	Definitions  []string `json:"definitions"`
	Examples     []string `json:"examples"`
}

// WiktionaryResponse represents the API response structure
type WiktionaryResponse struct {
	Word        string       `json:"word"`
	Definitions []Definition `json:"definitions"`
}

// NewService creates a new Wiktionary service
func NewService() *Service {
	return &Service{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		baseURL: "https://en.wiktionary.org/api/rest_v1",
	}
}

// GetDefinition fetches word definition from Wiktionary
func (s *Service) GetDefinition(ctx context.Context, word, language string) (*WiktionaryResponse, error) {
	// Use language-specific Wiktionary
	baseURL := s.baseURL
	if language == "finnish" {
		baseURL = "https://fi.wiktionary.org/api/rest_v1"
	}

	url := fmt.Sprintf("%s/page/definition/%s", baseURL, word)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("User-Agent", "Synapse/1.0 (Language Learning App)")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch from Wiktionary: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == 404 {
		return nil, fmt.Errorf("word not found in Wiktionary")
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("Wiktionary API returned status %d", resp.StatusCode)
	}

	// The actual response structure from Wiktionary REST API
	var apiResp map[string][]struct {
		PartOfSpeech string `json:"partOfSpeech"`
		Definitions  []struct {
			Definition string   `json:"definition"`
			Examples   []string `json:"examples"`
		} `json:"definitions"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Parse the response into our structure
	result := &WiktionaryResponse{
		Word:        word,
		Definitions: []Definition{},
	}

	for lang, entries := range apiResp {
		// We want the target language definitions
		// For Finnish words, look for "fi" or "Finnish" sections
		if language == "finnish" && (lang != "fi" && lang != "Finnish") {
			continue
		}

		for _, entry := range entries {
			def := Definition{
				PartOfSpeech: entry.PartOfSpeech,
				Definitions:  []string{},
				Examples:     []string{},
			}

			for _, d := range entry.Definitions {
				def.Definitions = append(def.Definitions, d.Definition)
				def.Examples = append(def.Examples, d.Examples...)
			}

			result.Definitions = append(result.Definitions, def)
		}
	}

	if len(result.Definitions) == 0 {
		return nil, fmt.Errorf("no definitions found")
	}

	return result, nil
}

// ExtractBestDefinition extracts the most relevant definition
func (s *Service) ExtractBestDefinition(word, language string) (definition string, partOfSpeech string, examples []string, err error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	resp, err := s.GetDefinition(ctx, word, language)
	if err != nil {
		return "", "", nil, err
	}

	if len(resp.Definitions) == 0 {
		return "", "", nil, fmt.Errorf("no definitions available")
	}

	// Take the first definition as the primary one
	firstDef := resp.Definitions[0]
	partOfSpeech = firstDef.PartOfSpeech

	// Get the first definition text
	if len(firstDef.Definitions) > 0 {
		definition = firstDef.Definitions[0]
	}

	// Get up to 2 examples
	maxExamples := 2
	if len(firstDef.Examples) < maxExamples {
		maxExamples = len(firstDef.Examples)
	}
	examples = firstDef.Examples[:maxExamples]

	return definition, partOfSpeech, examples, nil
}
