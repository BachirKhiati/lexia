package language

import (
	"context"
	"fmt"

	"github.com/BachirKhiati/synapse/internal/models"
	"github.com/BachirKhiati/synapse/internal/services/language/finnish"
)

// Service handles language-specific operations
type Service struct {
	conjugator *finnish.VerbConjugator
}

func NewService() *Service {
	return &Service{
		conjugator: finnish.NewVerbConjugator(),
	}
}

// AnalyzeWord performs deep analysis of a word
func (s *Service) AnalyzeWord(ctx context.Context, word string, language string) (*models.AnalyzerResponse, error) {
	// For now, simplified analysis
	// In production, integrate with Wiktionary API for real definitions

	response := &models.AnalyzerResponse{
		Word:         word,
		Lemma:        word, // TODO: Proper lemmatization
		Definition:   fmt.Sprintf("Definition of '%s'", word),
		PartOfSpeech: "verb", // TODO: Detect actual part of speech
		Examples: []string{
			fmt.Sprintf("Example sentence with %s", word),
			fmt.Sprintf("Another example with %s", word),
		},
		AudioURL:  "",
		InSynapse: false,
	}

	// If it looks like a Finnish verb (ends in common infinitive endings), conjugate it
	if language == "finnish" && s.isLikelyFinnishVerb(word) {
		conjugations := s.conjugator.ConjugateVerb(word)

		// Convert to models.WordConjugation
		var modelConjugations []models.WordConjugation
		for i, conj := range conjugations {
			modelConjugations = append(modelConjugations, models.WordConjugation{
				ID:       i + 1,
				WordID:   0, // Not saved yet
				Tense:    conj.Tense,
				Person:   conj.Person,
				Form:     conj.Form,
				Language: language,
			})
		}
		response.Conjugations = modelConjugations
	}

	return response, nil
}

// isLikelyFinnishVerb checks if a word looks like a Finnish verb infinitive
func (s *Service) isLikelyFinnishVerb(word string) bool {
	finnishVerbEndings := []string{
		"a", "ä",           // Type 1
		"da", "dä",         // Type 2
		"lla", "llä",       // Type 3
		"nna", "nnä",       // Type 3
		"rra", "rrä",       // Type 3
		"sta", "stä",       // Type 3
		"ata", "ätä",       // Type 4
		"ita", "itä",       // Type 5
		"eta", "etä",       // Type 6
	}

	for _, ending := range finnishVerbEndings {
		if len(word) > len(ending) && word[len(word)-len(ending):] == ending {
			return true
		}
	}
	return false
}

// GetConjugations returns all conjugations for a Finnish verb
func (s *Service) GetConjugations(word string) ([]models.WordConjugation, error) {
	// Placeholder - implement proper Finnish verb conjugation
	// Finnish has 6 tenses and complex conjugation rules
	return []models.WordConjugation{
		{Tense: "present", Person: "1sg", Form: word + "n"},
		{Tense: "present", Person: "2sg", Form: word + "t"},
		{Tense: "present", Person: "3sg", Form: word},
		{Tense: "past", Person: "1sg", Form: word + "in"},
		{Tense: "past", Person: "2sg", Form: word + "it"},
		{Tense: "past", Person: "3sg", Form: word + "i"},
	}, nil
}
