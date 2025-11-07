package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"google.golang.org/api/option"
	"github.com/google/generative-ai-go/genai"
)

type GeminiProvider struct {
	client *genai.Client
	model  *genai.GenerativeModel
}

func NewGeminiProvider(apiKey string) (*GeminiProvider, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("Gemini API key is required")
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %w", err)
	}

	model := client.GenerativeModel("gemini-1.5-flash")
	model.SetTemperature(0.7)
	model.SetMaxOutputTokens(1024)

	return &GeminiProvider{
		client: client,
		model:  model,
	}, nil
}

func (g *GeminiProvider) callGemini(ctx context.Context, prompt string) (string, error) {
	resp, err := g.model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", fmt.Errorf("Gemini API error: %w", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("empty response from Gemini")
	}

	return fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0]), nil
}

func (g *GeminiProvider) GenerateQuest(ctx context.Context, userLevel string, language string, ghostWords []string) (string, error) {
	ghostWordsStr := strings.Join(ghostWords, ", ")

	prompt := fmt.Sprintf(`You are a language teacher for %s. Generate a short learning quest for a %s level learner.

The quest should:
1. Be specific and actionable
2. Use these words: %s
3. Be appropriate for their level

Return ONLY valid JSON:
{
  "title": "Quest title",
  "description": "Quest instructions",
  "solution": "One example solution"
}`, language, userLevel, ghostWordsStr)

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

func (g *GeminiProvider) Close() error {
	return g.client.Close()
}
