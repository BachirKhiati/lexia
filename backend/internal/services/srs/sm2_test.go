package srs

import (
	"testing"
	"time"
)

func TestCalculateNextReview(t *testing.T) {
	service := NewService()

	tests := []struct {
		name            string
		quality         Quality
		easeFactor      float64
		repetitionCount int
		currentInterval int
		wantInterval    int
		wantMinEase     float64
	}{
		{
			name:            "First review - perfect recall",
			quality:         QualityPerfect,
			easeFactor:      2.5,
			repetitionCount: 0,
			currentInterval: 0,
			wantInterval:    1,
			wantMinEase:     2.5,
		},
		{
			name:            "Second review - good recall",
			quality:         QualityGood,
			easeFactor:      2.5,
			repetitionCount: 1,
			currentInterval: 1,
			wantInterval:    6,
			wantMinEase:     2.3,
		},
		{
			name:            "Third review - perfect recall",
			quality:         QualityPerfect,
			easeFactor:      2.5,
			repetitionCount: 2,
			currentInterval: 6,
			wantInterval:    15, // 6 * 2.6 ≈ 15
			wantMinEase:     2.5,
		},
		{
			name:            "Failed review - blackout",
			quality:         QualityBlackout,
			easeFactor:      2.5,
			repetitionCount: 5,
			currentInterval: 30,
			wantInterval:    1, // Reset to 1 day
			wantMinEase:     1.3,
		},
		{
			name:            "Minimum ease factor maintained",
			quality:         QualityWrong,
			easeFactor:      1.3,
			repetitionCount: 0,
			currentInterval: 0,
			wantInterval:    1,
			wantMinEase:     1.3,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := service.CalculateNextReview(
				tt.quality,
				tt.easeFactor,
				tt.repetitionCount,
				tt.currentInterval,
			)

			if result.Interval != tt.wantInterval {
				t.Errorf("Interval = %d, want %d", result.Interval, tt.wantInterval)
			}

			if result.EaseFactor < tt.wantMinEase {
				t.Errorf("EaseFactor = %.2f, want at least %.2f", result.EaseFactor, tt.wantMinEase)
			}

			// Ease factor should never go below 1.3
			if result.EaseFactor < 1.3 {
				t.Errorf("EaseFactor below minimum: %.2f", result.EaseFactor)
			}

			// NextReviewAt should be in the future
			if result.NextReviewAt.Before(time.Now()) {
				t.Error("NextReviewAt is in the past")
			}
		})
	}
}

func TestGetDueWords(t *testing.T) {
	service := NewService()
	now := time.Now()

	words := []Word{
		{ID: 1, Word: "overdue", NextReviewAt: now.Add(-1 * time.Hour)},
		{ID: 2, Word: "due_now", NextReviewAt: now},
		{ID: 3, Word: "future", NextReviewAt: now.Add(1 * time.Hour)},
		{ID: 4, Word: "never_reviewed", NextReviewAt: time.Time{}},
	}

	dueWords := service.GetDueWords(words)

	if len(dueWords) != 3 {
		t.Errorf("Expected 3 due words, got %d", len(dueWords))
	}

	// Check that the right words are returned
	expectedIDs := map[int]bool{1: true, 2: true, 4: true}
	for _, word := range dueWords {
		if !expectedIDs[word.ID] {
			t.Errorf("Unexpected word in due list: ID %d", word.ID)
		}
	}
}

func BenchmarkCalculateNextReview(b *testing.B) {
	service := NewService()

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		service.CalculateNextReview(QualityGood, 2.5, 3, 10)
	}
}
