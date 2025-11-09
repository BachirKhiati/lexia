package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"google.golang.org/genai"
)

type GeminiProvider struct {
	client *genai.Client
	model  string
}

func NewGeminiProvider(apiKey string) (*GeminiProvider, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("Gemini API key is required")
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %w", err)
	}

	return &GeminiProvider{
		client: client,
		model:  "gemini-2.0-flash-exp", // Using Gemini 2.0 Flash experimental
	}, nil
}

func (g *GeminiProvider) callGemini(ctx context.Context, prompt string) (string, error) {
	// Create content with the prompt
	parts := []*genai.Part{
		{Text: prompt},
	}

	content := []*genai.Content{
		{Parts: parts},
	}

	// Configure generation parameters
	config := &genai.GenerateContentConfig{
		Temperature:    genai.Ptr(float32(0.7)),
		MaxOutputTokens: 1024,
	}

	// Call Gemini API
	resp, err := g.client.Models.GenerateContent(ctx, g.model, content, config)
	if err != nil {
		return "", fmt.Errorf("Gemini API error: %w", err)
	}

	// Debug logging
	fmt.Printf("[GEMINI DEBUG] Model: %s\n", g.model)
	fmt.Printf("[GEMINI DEBUG] Prompt length: %d chars\n", len(prompt))

	// Extract text from response
	text := resp.Text()
	if text == "" {
		return "", fmt.Errorf("empty response from Gemini")
	}

	fmt.Printf("[GEMINI DEBUG] Response length: %d chars\n", len(text))
	fmt.Printf("[GEMINI DEBUG] Response preview: %s\n", truncate(text, 200))

	// Strip markdown code blocks if present
	text = stripMarkdownCodeBlocks(text)

	return text, nil
}

func truncate(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}

func stripMarkdownCodeBlocks(text string) string {
	// Remove markdown code blocks like ```json ... ``` or ``` ... ```
	text = strings.TrimSpace(text)

	// Check if it starts with ```json or ```
	if strings.HasPrefix(text, "```json") {
		text = strings.TrimPrefix(text, "```json")
		text = strings.TrimSpace(text)
	} else if strings.HasPrefix(text, "```") {
		text = strings.TrimPrefix(text, "```")
		text = strings.TrimSpace(text)
	}

	// Remove trailing ```
	if strings.HasSuffix(text, "```") {
		text = strings.TrimSuffix(text, "```")
		text = strings.TrimSpace(text)
	}

	return text
}

func (g *GeminiProvider) GenerateQuest(ctx context.Context, userLevel string, language string, ghostWords []string) (string, error) {
	var wordRequirement string
	if len(ghostWords) > 0 {
		ghostWordsStr := strings.Join(ghostWords, ", ")
		wordRequirement = fmt.Sprintf("2. Try to use some of these vocabulary words: %s", ghostWordsStr)
	} else {
		wordRequirement = "2. Choose appropriate vocabulary for the learner's level"
	}

	prompt := fmt.Sprintf(`You are a language teacher for %s. Generate a short learning quest for a %s level learner.

The quest should:
1. Be specific and actionable (e.g., "Write 3 sentences about your weekend")
%s
3. Be appropriate for their level
4. Be achievable in 5-10 minutes

Return ONLY valid JSON with no markdown formatting:
{
  "title": "Quest title",
  "description": "Quest instructions",
  "solution": "One example solution"
}`, language, userLevel, wordRequirement)

	return g.callGemini(ctx, prompt)
}

func (g *GeminiProvider) ValidateQuestSubmission(ctx context.Context, quest string, userText string, language string) (bool, string, error) {
	prompt := fmt.Sprintf(`Evaluate this %s language submission:

Quest: %s
Student's answer: %s

Return ONLY valid JSON:
{
  "is_valid": true/false,
  "feedback": "Brief feedback"
}`, language, quest, userText)

	response, err := g.callGemini(ctx, prompt)
	if err != nil {
		return false, "", err
	}

	var result struct {
		IsValid  bool   `json:"is_valid"`
		Feedback string `json:"feedback"`
	}
	if err := json.Unmarshal([]byte(response), &result); err != nil {
		return false, "", fmt.Errorf("failed to parse validation response: %w", err)
	}

	return result.IsValid, result.Feedback, nil
}

func (g *GeminiProvider) GenerateSocraticFeedback(ctx context.Context, userText string, language string) (string, error) {
	prompt := fmt.Sprintf(`Provide brief encouraging feedback for this %s text: "%s"`, language, userText)
	return g.callGemini(ctx, prompt)
}

func (g *GeminiProvider) Translate(ctx context.Context, text string, fromLang string, toLang string) (string, error) {
	prompt := fmt.Sprintf(`Translate from %s to %s: "%s"

Return ONLY the translation.`, fromLang, toLang, text)
	return g.callGemini(ctx, prompt)
}

func (g *GeminiProvider) AnalyzeGrammar(ctx context.Context, text string, language string) (map[string]interface{}, error) {
	prompt := fmt.Sprintf(`Analyze grammar of this %s text: "%s"

Return valid JSON:
{
  "correct": true/false,
  "errors": ["errors"],
  "suggestions": ["suggestions"]
}`, language, text)

	response, err := g.callGemini(ctx, prompt)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	if err := json.Unmarshal([]byte(response), &result); err != nil {
		return nil, fmt.Errorf("failed to parse grammar analysis: %w", err)
	}

	return result, nil
}

func (g *GeminiProvider) GetWordDefinition(ctx context.Context, word string, language string) (definition string, partOfSpeech string, examples []string, err error) {
	prompt := fmt.Sprintf(`You are a dictionary for %s language. Provide a definition for the word "%s".

Return ONLY valid JSON with no markdown formatting:
{
  "definition": "Clear, concise definition in English",
  "part_of_speech": "noun/verb/adjective/etc",
  "examples": ["Example sentence 1", "Example sentence 2"]
}

Guidelines:
- definition: A single clear sentence explaining what the word means
- part_of_speech: The word's grammatical category (noun, verb, adjective, adverb, etc.)
- examples: 2-3 realistic example sentences showing how to use the word in context`, language, word)

	response, err := g.callGemini(ctx, prompt)
	if err != nil {
		return "", "", nil, fmt.Errorf("failed to get AI definition: %w", err)
	}

	var result struct {
		Definition   string   `json:"definition"`
		PartOfSpeech string   `json:"part_of_speech"`
		Examples     []string `json:"examples"`
	}

	if err := json.Unmarshal([]byte(response), &result); err != nil {
		return "", "", nil, fmt.Errorf("failed to parse AI definition response: %w", err)
	}

	// Validate we got meaningful data
	if result.Definition == "" {
		return "", "", nil, fmt.Errorf("AI returned empty definition")
	}

	return result.Definition, result.PartOfSpeech, result.Examples, nil
}

func (g *GeminiProvider) Close() error {
	// New SDK doesn't require explicit close
	return nil
}
