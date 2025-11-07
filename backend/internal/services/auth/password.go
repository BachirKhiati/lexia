package auth

import (
	"crypto/rand"
	"encoding/base64"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword creates a bcrypt hash of a password
func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// CheckPassword compares a password with its hash
func CheckPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// GenerateRandomToken generates a random token for email verification, etc.
func GenerateRandomToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(bytes), nil
}
