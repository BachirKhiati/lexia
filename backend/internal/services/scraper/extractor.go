package scraper

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

type Article struct {
	Title   string
	Content string
	URL     string
}

type Service struct {
	httpClient *http.Client
}

func NewService() *Service {
	return &Service{
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// ExtractArticle fetches a URL and extracts the main content
func (s *Service) ExtractArticle(urlStr string) (*Article, error) {
	// Validate URL
	parsedURL, err := url.Parse(urlStr)
	if err != nil {
		return nil, fmt.Errorf("invalid URL: %w", err)
	}

	// Fetch URL
	resp, err := s.httpClient.Get(parsedURL.String())
	if err != nil {
		return nil, fmt.Errorf("failed to fetch URL: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}

	// Parse HTML
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML: %w", err)
	}

	// Extract title
	title := doc.Find("title").First().Text()
	if title == "" {
		title = doc.Find("h1").First().Text()
	}

	// Extract main content using multiple strategies
	content := s.extractContent(doc)

	if content == "" {
		return nil, fmt.Errorf("could not extract content from URL")
	}

	return &Article{
		Title:   strings.TrimSpace(title),
		Content: strings.TrimSpace(content),
		URL:     urlStr,
	}, nil
}

// extractContent uses multiple strategies to find the main content
func (s *Service) extractContent(doc *goquery.Document) string {
	// Strategy 1: Look for article tag
	if article := doc.Find("article").First(); article.Length() > 0 {
		return s.extractText(article)
	}

	// Strategy 2: Look for main tag
	if main := doc.Find("main").First(); main.Length() > 0 {
		return s.extractText(main)
	}

	// Strategy 3: Look for common content selectors
	selectors := []string{
		"[role='main']",
		".article-content",
		".post-content",
		".entry-content",
		".content",
		"#content",
	}

	for _, selector := range selectors {
		if elem := doc.Find(selector).First(); elem.Length() > 0 {
			return s.extractText(elem)
		}
	}

	// Strategy 4: Find the largest text block
	return s.findLargestTextBlock(doc)
}

// extractText extracts text from a goquery selection, preserving paragraphs
func (s *Service) extractText(selection *goquery.Selection) string {
	var text strings.Builder

	// Remove unwanted elements
	selection.Find("script, style, nav, footer, header, aside, iframe").Remove()

	// Extract paragraphs
	selection.Find("p").Each(func(i int, p *goquery.Selection) {
		if t := strings.TrimSpace(p.Text()); t != "" {
			text.WriteString(t)
			text.WriteString("\n\n")
		}
	})

	// If no paragraphs, try other block elements
	if text.Len() == 0 {
		selection.Find("div, section").Each(func(i int, elem *goquery.Selection) {
			if t := strings.TrimSpace(elem.Text()); t != "" && len(t) > 50 {
				text.WriteString(t)
				text.WriteString("\n\n")
			}
		})
	}

	return text.String()
}

// findLargestTextBlock finds the element with the most text content
func (s *Service) findLargestTextBlock(doc *goquery.Document) string {
	var maxText string
	maxLength := 0

	doc.Find("div, section, article").Each(func(i int, elem *goquery.Selection) {
		text := s.extractText(elem)
		if len(text) > maxLength {
			maxLength = len(text)
			maxText = text
		}
	})

	return maxText
}

// ExtractYouTubeTranscript extracts transcript from YouTube videos (placeholder)
func (s *Service) ExtractYouTubeTranscript(videoID string) (string, error) {
	// TODO: Implement YouTube transcript extraction
	// This would require the YouTube API or a transcript extraction library
	return "", fmt.Errorf("YouTube transcript extraction not yet implemented")
}

// IsYouTubeURL checks if a URL is a YouTube video
func IsYouTubeURL(urlStr string) bool {
	return strings.Contains(urlStr, "youtube.com") || strings.Contains(urlStr, "youtu.be")
}
