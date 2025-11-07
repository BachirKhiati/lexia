package finnish

import (
	"testing"
)

func TestVerbConjugation(t *testing.T) {
	conjugator := NewVerbConjugator()

	tests := []struct {
		infinitive string
		verbType   VerbType
		want       string // expected 1sg present
	}{
		{"puhua", Type1, "puhun"},      // Type 1: to speak
		{"syödä", Type2, "syön"},       // Type 2: to eat
		{"tulla", Type3, "tulen"},      // Type 3: to come
		{"haluta", Type4, "haluan"},    // Type 4: to want
		{"tarvita", Type5, "tarvitsen"}, // Type 5: to need
		{"vanheta", Type6, "vanhenen"},  // Type 6: to age
	}

	for _, tt := range tests {
		t.Run(tt.infinitive, func(t *testing.T) {
			// Test verb type detection
			got := conjugator.determineVerbType(tt.infinitive)
			if got != tt.verbType {
				t.Errorf("determineVerbType(%s) = %v, want %v", tt.infinitive, got, tt.verbType)
			}

			// Test conjugation
			conjugations := conjugator.ConjugateVerb(tt.infinitive)
			if len(conjugations) == 0 {
				t.Errorf("ConjugateVerb(%s) returned no conjugations", tt.infinitive)
				return
			}

			// Check first person singular present
			firstSg := conjugations[0]
			if firstSg.Form != tt.want {
				t.Errorf("1sg present of %s = %s, want %s", tt.infinitive, firstSg.Form, tt.want)
			}
		})
	}
}

func TestVowelHarmony(t *testing.T) {
	conjugator := NewVerbConjugator()

	tests := []struct {
		word string
		want bool
	}{
		{"puhun", true},   // back vowels (u, a, o)
		{"syödä", false},  // front vowels (ö, ä, y)
		{"tulla", true},   // back
		{"mennä", false},  // front
	}

	for _, tt := range tests {
		got := conjugator.usesBackVowels(tt.word)
		if got != tt.want {
			t.Errorf("usesBackVowels(%s) = %v, want %v", tt.word, got, tt.want)
		}
	}
}
