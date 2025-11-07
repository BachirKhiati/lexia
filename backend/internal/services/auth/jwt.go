package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrInvalidToken = errors.New("invalid token")
	ErrExpiredToken = errors.New("token has expired")
)

type Claims struct {
	UserID   int    `json:"user_id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

type Service struct {
	secretKey []byte
	issuer    string
}

func NewService(secretKey string, issuer string) *Service {
	return &Service{
		secretKey: []byte(secretKey),
		issuer:    issuer,
	}
}

// GenerateToken creates a new JWT token for a user
func (s *Service) GenerateToken(userID int, email, username string) (string, error) {
	claims := &Claims{
		UserID:   userID,
		Email:    email,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    s.issuer,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secretKey)
}

// ValidateToken validates a JWT token and returns the claims
func (s *Service) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return s.secretKey, nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	// Check if token is expired
	if claims.ExpiresAt.Before(time.Now()) {
		return nil, ErrExpiredToken
	}

	return claims, nil
}

// RefreshToken generates a new token with extended expiration
func (s *Service) RefreshToken(oldToken string) (string, error) {
	claims, err := s.ValidateToken(oldToken)
	if err != nil {
		return "", err
	}

	return s.GenerateToken(claims.UserID, claims.Email, claims.Username)
}
