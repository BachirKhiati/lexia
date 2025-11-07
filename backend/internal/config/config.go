package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	AI       AIConfig
	Language LanguageConfig
	CORS     CORSConfig
}

type ServerConfig struct {
	Port        string
	Environment string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
}

type AIConfig struct {
	ClaudeAPIKey       string
	GeminiAPIKey       string
	OpenAIAPIKey       string
	DefaultProvider    string
}

type LanguageConfig struct {
	DefaultLanguage     string
	SupportedLanguages  []string
}

type CORSConfig struct {
	AllowedOrigins []string
}

func Load() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	return &Config{
		Server: ServerConfig{
			Port:        getEnv("PORT", "8080"),
			Environment: getEnv("ENVIRONMENT", "development"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "synapse"),
			Password: getEnv("DB_PASSWORD", ""),
			Name:     getEnv("DB_NAME", "synapse_db"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
		},
		AI: AIConfig{
			ClaudeAPIKey:    getEnv("CLAUDE_API_KEY", ""),
			GeminiAPIKey:    getEnv("GEMINI_API_KEY", ""),
			OpenAIAPIKey:    getEnv("OPENAI_API_KEY", ""),
			DefaultProvider: getEnv("DEFAULT_AI_PROVIDER", "claude"),
		},
		Language: LanguageConfig{
			DefaultLanguage:    getEnv("DEFAULT_LANGUAGE", "finnish"),
			SupportedLanguages: strings.Split(getEnv("SUPPORTED_LANGUAGES", "finnish,english"), ","),
		},
		CORS: CORSConfig{
			AllowedOrigins: strings.Split(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000"), ","),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
