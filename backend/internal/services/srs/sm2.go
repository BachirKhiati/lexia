package srs

import (
	"math"
	"time"
)

// Quality represents the user's recall quality (0-5)
// 0: Complete blackout, didn't remember
// 1: Incorrect response, but upon seeing correct answer it felt familiar
// 2: Incorrect response, but upon seeing correct answer it seemed easy to remember
// 3: Correct response, but required significant difficulty to recall
// 4: Correct response, after some hesitation
// 5: Perfect response, immediate recall
type Quality int

const (
	QualityBlackout Quality = 0
	QualityWrong    Quality = 1
	QualityHard     Quality = 2
	QualityGood     Quality = 3
	QualityEasy     Quality = 4
	QualityPerfect  Quality = 5
)

// ReviewResult contains the updated SRS parameters after a review
type ReviewResult struct {
	EaseFactor      float64
	RepetitionCount int
	Interval        int // days until next review
	NextReviewAt    time.Time
}

// Service implements the SM-2 spaced repetition algorithm
type Service struct{}

func NewService() *Service {
	return &Service{}
}

// CalculateNextReview implements the SM-2 algorithm
// Returns the updated ease factor, repetition count, and interval
func (s *Service) CalculateNextReview(
	quality Quality,
	easeFactor float64,
	repetitionCount int,
	currentInterval int,
) ReviewResult {
	q := float64(quality)

	// Calculate new ease factor
	newEaseFactor := easeFactor + (0.1 - (5-q)*(0.08+(5-q)*0.02))

	// Ease factor should not drop below 1.3
	if newEaseFactor < 1.3 {
		newEaseFactor = 1.3
	}

	var newInterval int
	var newRepetitionCount int

	// If quality < 3, reset the repetition
	if quality < QualityGood {
		newRepetitionCount = 0
		newInterval = 1 // Review again tomorrow
	} else {
		newRepetitionCount = repetitionCount + 1

		// Calculate interval based on repetition count
		switch newRepetitionCount {
		case 1:
			newInterval = 1 // First review: 1 day
		case 2:
			newInterval = 6 // Second review: 6 days
		default:
			// Subsequent reviews: previous interval * ease factor
			newInterval = int(math.Round(float64(currentInterval) * newEaseFactor))
		}
	}

	// Calculate next review time
	nextReviewAt := time.Now().Add(time.Duration(newInterval) * 24 * time.Hour)

	return ReviewResult{
		EaseFactor:      newEaseFactor,
		RepetitionCount: newRepetitionCount,
		Interval:        newInterval,
		NextReviewAt:    nextReviewAt,
	}
}

// GetDueWords returns words that are due for review
func (s *Service) GetDueWords(words []Word) []Word {
	now := time.Now()
	var dueWords []Word

	for _, word := range words {
		if word.NextReviewAt.IsZero() {
			// Never reviewed, include it
			dueWords = append(dueWords, word)
		} else if word.NextReviewAt.Before(now) || word.NextReviewAt.Equal(now) {
			// Due for review
			dueWords = append(dueWords, word)
		}
	}

	return dueWords
}

// Word represents a word in the SRS system
type Word struct {
	ID              int
	Word            string
	NextReviewAt    time.Time
	EaseFactor      float64
	RepetitionCount int
	Interval        int
}
