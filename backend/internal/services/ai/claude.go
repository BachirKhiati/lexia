package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

const claudeAPIURL = "https://api.anthropic.com/v1/messages"

type ClaudeProvider struct {
	apiKey     string
	httpClient *http.Client
}

type claudeRequest struct {
	Model     string          `json:"model"`
	MaxTokens int             `json:"max_tokens"`
	Messages  []claudeMessage `json:"messages"`
}

type claudeMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type claudeResponse struct {
	Content []struct {
		Text string `json:"text"`
	} `json:"content"`
}

func NewClaudeProvider(apiKey string) (*ClaudeProvider, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("Claude API key is required")
	}

	return &ClaudeProvider{
		apiKey:     apiKey,
		httpClient: &http.Client{},
	}, nil
}

func (c *ClaudeProvider) callClaude(ctx context.Context, prompt string) (string, error) {
	reqBody := claudeRequest{
		Model:     "claude-3-5-sonnet-20241022",
		MaxTokens: 1024,
		Messages: []claudeMessage{
			{
				Role:    "user",
				Content: prompt,
			},
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", claudeAPIURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", c.apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("API request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var claudeResp claudeResponse
	if err := json.Unmarshal(body, &claudeResp); err != nil {
		return "", fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if len(claudeResp.Content) == 0 {
		return "", fmt.Errorf("empty response from Claude")
	}

	return claudeResp.Content[0].Text, nil
}

func (c *ClaudeProvider) GenerateQuest(ctx context.Context, userLevel string, language string, ghostWords []string) (string, error) {
	ghostWordsStr := strings.Join(ghostWords, ", ")

	prompt := fmt.Sprintf(`You are a Socratic language teacher for %s. Generate a short, engaging quest (learning task) for a %s level learner.

The quest should:
1. Be specific and actionable (e.g., "Write 3 sentences about your morning using past tense")
2. Incorporate these words the user wants to learn: %s
3. Be appropriate for their level
4. Include clear success criteria

Return ONLY a JSON object with this structure:
{
  "title": "Quest title",
  "description": "Detailed quest instructions",
  "solution": "One example solution that demonstrates success"
}`, language, userLevel, ghostWordsStr)

	return c.callClaude(ctx, prompt)
}

func (c *ClaudeProvider) ValidateQuestSubmission(ctx context.Context, quest string, userText string, language string) (bool, string, error) {
	prompt := fmt.Sprintf(`You are a Socratic %s teacher. A student submitted this text for the following quest:

Quest: %s
Student's submission: %s

Evaluate their submission and provide Socratic guidance.

Return ONLY a JSON object:
{
  "is_valid": true/false,
  "feedback": "Socratic feedback (guide them, don't just correct)"
}`, language, quest, userText)

	response, err := c.callClaude(ctx, prompt)
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

func (c *ClaudeProvider) GenerateSocraticFeedback(ctx context.Context, userText string, language string) (string, error) {
	prompt := fmt.Sprintf(`You are a Socratic %s teacher. The student wrote: "%s"

Provide brief, encouraging Socratic feedback that guides them without giving direct answers.`, language, userText)

	return c.callClaude(ctx, prompt)
}

func (c *ClaudeProvider) Translate(ctx context.Context, text string, fromLang string, toLang string) (string, error) {
	prompt := fmt.Sprintf(`Translate this text from %s to %s: "%s"

Return ONLY the translated text, nothing else.`, fromLang, toLang, text)

	return c.callClaude(ctx, prompt)
}

func (c *ClaudeProvider) AnalyzeGrammar(ctx context.Context, text string, language string) (map[string]interface{}, error) {
	prompt := fmt.Sprintf(`Analyze the grammar of this %s text: "%s"

Return a JSON object with:
{
  "correct": true/false,
  "errors": ["error description"],
  "suggestions": ["suggestion"]
}`, language, text)

	response, err := c.callClaude(ctx, prompt)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	if err := json.Unmarshal([]byte(response), &result); err != nil {
		return nil, fmt.Errorf("failed to parse grammar analysis: %w", err)
	}

	return result, nil
}

func (c *ClaudeProvider) GetWordDefinition(ctx context.Context, word string, language string) (definition string, partOfSpeech string, examples []string, err error) {
	prompt := fmt.Sprintf(`You are a dictionary for %s language. Provide a definition for the word "%s".

Return ONLY a JSON object with no additional text:
{
  "definition": "Clear, concise definition in English",
  "part_of_speech": "noun/verb/adjective/etc",
  "examples": ["Example sentence 1", "Example sentence 2"]
}

Guidelines:
- definition: A single clear sentence explaining what the word means
- part_of_speech: The word's grammatical category (noun, verb, adjective, adverb, etc.)
- examples: 2-3 realistic example sentences showing how to use the word in context`, language, word)

	response, err := c.callClaude(ctx, prompt)
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
