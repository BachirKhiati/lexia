package language

import (
	"strings"
)

// VerbType represents the 6 main Finnish verb types
type VerbType int

const (
	Type1 VerbType = iota + 1 // -A/Ä verbs (sanoa, puhua)
	Type2                     // -DA verbs (syödä, juoda)
	Type3                     // -LA/-NA/-RA/-STA verbs (tulla, mennä)
	Type4                     // -ATA/-ÄTA verbs (haluta, pelätä)
	Type5                     // -ITA/-ITÄ verbs (tarvita, häiritä)
	Type6                     // -ETA/-ETÄ verbs (vanheta, paeta)
)

// Conjugation represents a verb conjugation
type Conjugation struct {
	Tense  string `json:"tense"`
	Person string `json:"person"`
	Form   string `json:"form"`
}

// VerbConjugator handles Finnish verb conjugation
type VerbConjugator struct{}

func NewVerbConjugator() *VerbConjugator {
	return &VerbConjugator{}
}

// ConjugateVerb returns all conjugations for a Finnish verb
func (vc *VerbConjugator) ConjugateVerb(infinitive string) []Conjugation {
	verbType := vc.determineVerbType(infinitive)
	stem := vc.extractStem(infinitive, verbType)

	var conjugations []Conjugation

	// Present tense
	conjugations = append(conjugations, vc.conjugatePresent(stem, verbType)...)

	// Past tense
	conjugations = append(conjugations, vc.conjugatePast(stem, verbType)...)

	// Conditional
	conjugations = append(conjugations, vc.conjugateConditional(stem, verbType)...)

	return conjugations
}

// determineVerbType identifies which of the 6 verb types
func (vc *VerbConjugator) determineVerbType(infinitive string) VerbType {
	if strings.HasSuffix(infinitive, "da") || strings.HasSuffix(infinitive, "dä") {
		return Type2
	}

	if strings.HasSuffix(infinitive, "lla") || strings.HasSuffix(infinitive, "llä") ||
		strings.HasSuffix(infinitive, "nna") || strings.HasSuffix(infinitive, "nnä") ||
		strings.HasSuffix(infinitive, "rra") || strings.HasSuffix(infinitive, "rrä") ||
		strings.HasSuffix(infinitive, "sta") || strings.HasSuffix(infinitive, "stä") {
		return Type3
	}

	if strings.HasSuffix(infinitive, "ata") || strings.HasSuffix(infinitive, "ätä") {
		return Type4
	}

	if strings.HasSuffix(infinitive, "ita") || strings.HasSuffix(infinitive, "itä") {
		return Type5
	}

	if strings.HasSuffix(infinitive, "eta") || strings.HasSuffix(infinitive, "etä") {
		return Type6
	}

	// Default to Type 1
	return Type1
}

// extractStem removes the infinitive ending
func (vc *VerbConjugator) extractStem(infinitive string, verbType VerbType) string {
	switch verbType {
	case Type1:
		return strings.TrimSuffix(strings.TrimSuffix(infinitive, "a"), "ä")
	case Type2:
		return strings.TrimSuffix(strings.TrimSuffix(infinitive, "da"), "dä")
	case Type3:
		if strings.HasSuffix(infinitive, "lla") || strings.HasSuffix(infinitive, "llä") {
			return strings.TrimSuffix(strings.TrimSuffix(infinitive, "lla"), "llä") + "le"
		}
		if strings.HasSuffix(infinitive, "nna") || strings.HasSuffix(infinitive, "nnä") {
			return strings.TrimSuffix(strings.TrimSuffix(infinitive, "nna"), "nnä") + "ne"
		}
		if strings.HasSuffix(infinitive, "rra") || strings.HasSuffix(infinitive, "rrä") {
			return strings.TrimSuffix(strings.TrimSuffix(infinitive, "rra"), "rrä") + "re"
		}
		if strings.HasSuffix(infinitive, "sta") || strings.HasSuffix(infinitive, "stä") {
			return strings.TrimSuffix(strings.TrimSuffix(infinitive, "sta"), "stä") + "se"
		}
	case Type4:
		return strings.TrimSuffix(strings.TrimSuffix(infinitive, "ata"), "ätä") + "a"
	case Type5:
		return strings.TrimSuffix(strings.TrimSuffix(infinitive, "ita"), "itä") + "itse"
	case Type6:
		return strings.TrimSuffix(strings.TrimSuffix(infinitive, "eta"), "etä") + "ene"
	}
	return infinitive
}

// conjugatePresent conjugates present tense
func (vc *VerbConjugator) conjugatePresent(stem string, verbType VerbType) []Conjugation {
	var conjugations []Conjugation
	backVowel := vc.usesBackVowels(stem)

	switch verbType {
	case Type1:
		// Type 1: sanoa (sano-) → sanon, sanot, sanoo...
		conjugations = []Conjugation{
			{Tense: "present", Person: "1sg", Form: stem + "n"},
			{Tense: "present", Person: "2sg", Form: stem + "t"},
			{Tense: "present", Person: "3sg", Form: stem + vc.vowel(backVowel, "o", "ö")},
			{Tense: "present", Person: "1pl", Form: stem + "mme"},
			{Tense: "present", Person: "2pl", Form: stem + "tte"},
			{Tense: "present", Person: "3pl", Form: stem + "vat"},
		}
	case Type2:
		// Type 2: syödä (syö-) → syön, syöt, syö...
		conjugations = []Conjugation{
			{Tense: "present", Person: "1sg", Form: stem + "n"},
			{Tense: "present", Person: "2sg", Form: stem + "t"},
			{Tense: "present", Person: "3sg", Form: stem},
			{Tense: "present", Person: "1pl", Form: stem + "mme"},
			{Tense: "present", Person: "2pl", Form: stem + "tte"},
			{Tense: "present", Person: "3pl", Form: stem + "vät"},
		}
	case Type3:
		// Type 3: tulla (tule-) → tulen, tulet, tulee...
		conjugations = []Conjugation{
			{Tense: "present", Person: "1sg", Form: stem + "n"},
			{Tense: "present", Person: "2sg", Form: stem + "t"},
			{Tense: "present", Person: "3sg", Form: stem + "e"},
			{Tense: "present", Person: "1pl", Form: stem + "mme"},
			{Tense: "present", Person: "2pl", Form: stem + "tte"},
			{Tense: "present", Person: "3pl", Form: stem + "vat"},
		}
	case Type4:
		// Type 4: haluta (halu-a-) → haluan, haluat, haluaa...
		a := vc.vowel(backVowel, "a", "ä")
		conjugations = []Conjugation{
			{Tense: "present", Person: "1sg", Form: stem + "n"},
			{Tense: "present", Person: "2sg", Form: stem + "t"},
			{Tense: "present", Person: "3sg", Form: stem + a},
			{Tense: "present", Person: "1pl", Form: stem + "mme"},
			{Tense: "present", Person: "2pl", Form: stem + "tte"},
			{Tense: "present", Person: "3pl", Form: stem + "vat"},
		}
	case Type5:
		// Type 5: tarvita (tarvitse-) → tarvitsen, tarvitset...
		conjugations = []Conjugation{
			{Tense: "present", Person: "1sg", Form: stem + "n"},
			{Tense: "present", Person: "2sg", Form: stem + "t"},
			{Tense: "present", Person: "3sg", Form: stem + "e"},
			{Tense: "present", Person: "1pl", Form: stem + "mme"},
			{Tense: "present", Person: "2pl", Form: stem + "tte"},
			{Tense: "present", Person: "3pl", Form: stem + "vat"},
		}
	case Type6:
		// Type 6: vanheta (vanhene-) → vanhenen, vanhenet...
		conjugations = []Conjugation{
			{Tense: "present", Person: "1sg", Form: stem + "n"},
			{Tense: "present", Person: "2sg", Form: stem + "t"},
			{Tense: "present", Person: "3sg", Form: stem + "e"},
			{Tense: "present", Person: "1pl", Form: stem + "mme"},
			{Tense: "present", Person: "2pl", Form: stem + "tte"},
			{Tense: "present", Person: "3pl", Form: stem + "vat"},
		}
	}

	return conjugations
}

// conjugatePast conjugates past tense
func (vc *VerbConjugator) conjugatePast(stem string, verbType VerbType) []Conjugation {
	backVowel := vc.usesBackVowels(stem)
	pastMarker := vc.vowel(backVowel, "i", "i") // Always 'i' for past

	// Simplified past tense (doesn't handle all consonant gradation)
	pastStem := stem + pastMarker

	return []Conjugation{
		{Tense: "past", Person: "1sg", Form: pastStem + "n"},
		{Tense: "past", Person: "2sg", Form: pastStem + "t"},
		{Tense: "past", Person: "3sg", Form: pastStem},
		{Tense: "past", Person: "1pl", Form: pastStem + "mme"},
		{Tense: "past", Person: "2pl", Form: pastStem + "tte"},
		{Tense: "past", Person: "3pl", Form: pastStem + "vat"},
	}
}

// conjugateConditional conjugates conditional mood
func (vc *VerbConjugator) conjugateConditional(stem string, verbType VerbType) []Conjugation {
	backVowel := vc.usesBackVowels(stem)
	condMarker := vc.vowel(backVowel, "isi", "isi")

	condStem := stem + condMarker

	return []Conjugation{
		{Tense: "conditional", Person: "1sg", Form: condStem + "n"},
		{Tense: "conditional", Person: "2sg", Form: condStem + "t"},
		{Tense: "conditional", Person: "3sg", Form: condStem},
		{Tense: "conditional", Person: "1pl", Form: condStem + "mme"},
		{Tense: "conditional", Person: "2pl", Form: condStem + "tte"},
		{Tense: "conditional", Person: "3pl", Form: condStem + "vat"},
	}
}

// usesBackVowels determines if the word uses back vowels (a, o, u) or front vowels (ä, ö, y)
func (vc *VerbConjugator) usesBackVowels(word string) bool {
	// Check last vowels for vowel harmony
	for i := len(word) - 1; i >= 0; i-- {
		switch word[i] {
		case 'a', 'o', 'u':
			return true
		case 'ä', 'ö', 'y':
			return false
		}
	}
	return true // Default to back vowels
}

// vowel returns the appropriate vowel based on vowel harmony
func (vc *VerbConjugator) vowel(backVowel bool, back, front string) string {
	if backVowel {
		return back
	}
	return front
}

// Common Finnish verbs for testing
var CommonVerbs = map[string]string{
	"olla":     "to be",
	"sanoa":    "to say",
	"tehdä":    "to do/make",
	"tulla":    "to come",
	"mennä":    "to go",
	"haluta":   "to want",
	"voida":    "to be able",
	"puhua":    "to speak",
	"kirjoittaa": "to write",
	"lukea":    "to read",
	"oppia":    "to learn",
	"tietää":   "to know",
	"nähdä":    "to see",
	"syödä":    "to eat",
	"juoda":    "to drink",
}
