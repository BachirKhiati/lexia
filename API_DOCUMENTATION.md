# Synapse API Documentation

This document provides comprehensive documentation for the Synapse API.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Swagger UI](#swagger-ui)

---

## Overview

The Synapse API is a RESTful API built with Go (Chi router) that powers the Synapse language learning application.

**Base URL**: `http://localhost:8080/api/v1`
**Production URL**: `https://your-domain.com/api/v1`

**Content Type**: All requests and responses use `application/json`

**API Version**: v1

---

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens).

### Obtaining a Token

Register or login to receive a JWT token:

```bash
# Register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "user123",
    "password": "securepassword",
    "language": "finnish"
  }'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user123",
    "language": "finnish"
  }
}
```

### Using the Token

Include the token in the `Authorization` header:

```bash
curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/v1/auth/register

Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "user123",
  "password": "securepassword",
  "language": "finnish"
}
```

**Response** (201 Created):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user123",
    "language": "finnish"
  }
}
```

**Errors**:
- `400 Bad Request`: Invalid request body or validation failed
- `409 Conflict`: Email or username already exists

---

#### POST /api/v1/auth/login

Authenticate and receive a JWT token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user123",
    "language": "finnish"
  }
}
```

**Errors**:
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Invalid credentials

---

#### GET /api/v1/auth/me

Get current authenticated user information.

**Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "user123",
  "language": "finnish"
}
```

**Errors**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found

---

#### POST /api/v1/auth/refresh

Refresh JWT token.

**Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Failed to generate token

---

### Analyzer Endpoints

#### POST /api/v1/analyze

Analyze a word in the target language (universal pop-up analyzer).

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "word": "kirja",
  "language": "finnish"
}
```

**Response** (200 OK):
```json
{
  "word": "kirja",
  "definition": "book",
  "part_of_speech": "noun",
  "conjugations": [],
  "examples": [
    "Luen kirjaa",
    "Minulla on kirja"
  ],
  "in_synapse": false
}
```

**Errors**:
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Analysis failed

---

### Quest Endpoints (The Scribe)

#### GET /api/v1/users/{userID}/quests

Get all quests for a user.

**Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "user_id": 123,
    "title": "Write about your day",
    "description": "Write a short paragraph about what you did today using these words: kirja, kahvi, ystävä",
    "solution": "Example solution...",
    "difficulty": "beginner",
    "status": "pending",
    "created_at": "2025-11-07T10:00:00Z",
    "completed_at": null
  }
]
```

**Errors**:
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Database error

---

#### POST /api/v1/users/{userID}/quests/generate

Generate a new AI-powered quest.

**Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
{
  "id": 2,
  "user_id": 123,
  "title": "Describe your morning routine",
  "description": "Write 3-5 sentences about your morning routine using: herätä, juoda, syödä",
  "solution": "Example solution...",
  "difficulty": "beginner",
  "status": "pending",
  "created_at": "2025-11-07T11:00:00Z",
  "completed_at": null
}
```

**Errors**:
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: AI generation or database error

---

#### POST /api/v1/users/{userID}/quests/validate

Validate a quest submission.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "quest_id": 1,
  "user_text": "Tänään luin kirjaa ja join kahvia ystäväni kanssa."
}
```

**Response** (200 OK):
```json
{
  "is_valid": true,
  "feedback": "Great work! Your sentence structure is correct and you used all the required words naturally."
}
```

**Errors**:
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Quest not found
- `500 Internal Server Error`: Validation error

---

### Synapse Endpoints (Mind Map)

#### GET /api/v1/users/{userID}/synapse

Get user's mind map (all learned words).

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `status` (optional): Filter by word status (`ghost`, `liquid`, `solid`)

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "user_id": 123,
    "word": "kirja",
    "definition": "book",
    "language": "finnish",
    "status": "solid",
    "added_at": "2025-11-01T10:00:00Z"
  }
]
```

**Errors**:
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Database error

---

#### POST /api/v1/users/{userID}/synapse/words

Add a word to the mind map.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "word": "kahvi",
  "definition": "coffee",
  "language": "finnish"
}
```

**Response** (201 Created):
```json
{
  "id": 2,
  "user_id": 123,
  "word": "kahvi",
  "definition": "coffee",
  "language": "finnish",
  "status": "ghost",
  "added_at": "2025-11-07T12:00:00Z"
}
```

**Errors**:
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Invalid or missing token
- `409 Conflict`: Word already exists in mind map
- `500 Internal Server Error`: Database error

---

### Lens Endpoints (Content Importer)

#### POST /api/v1/lens/import

Import an article from a URL.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "url": "https://example.com/article",
  "language": "finnish"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "user_id": 123,
  "title": "Article Title",
  "url": "https://example.com/article",
  "content": "Full article text...",
  "language": "finnish",
  "imported_at": "2025-11-07T13:00:00Z"
}
```

**Errors**:
- `400 Bad Request`: Invalid URL or request body
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Import failed

---

#### GET /api/v1/lens/articles

Get user's imported articles.

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `limit` (optional): Number of articles to return (default: 20)
- `offset` (optional): Offset for pagination (default: 0)

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "user_id": 123,
    "title": "Article Title",
    "url": "https://example.com/article",
    "language": "finnish",
    "imported_at": "2025-11-07T13:00:00Z"
  }
]
```

**Errors**:
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Database error

---

### User Progress Endpoints

#### GET /api/v1/users/progress

Get user's learning progress and statistics.

**Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
{
  "user_id": 123,
  "words_mastered": 47,
  "quests_completed": 12,
  "streak_days": 5,
  "last_active_at": "2025-11-07T14:00:00Z"
}
```

**Errors**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Progress not found
- `500 Internal Server Error`: Database error

---

### Spaced Repetition System (SRS) Endpoints

#### GET /api/v1/srs/due

Get words due for review.

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `limit` (optional): Maximum number of words to return (default: 20)

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "word": "kirja",
    "definition": "book",
    "ease_factor": 2.5,
    "interval": 7,
    "repetitions": 3,
    "next_review_at": "2025-11-07T10:00:00Z"
  }
]
```

**Errors**:
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Database error

---

#### POST /api/v1/srs/review

Submit a review for a word (updates SRS data).

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "word_id": 1,
  "quality": 4
}
```

**Quality Scale**:
- `0`: Complete blackout
- `1`: Incorrect response, correct one remembered
- `2`: Incorrect response, correct one seemed easy to recall
- `3`: Correct response, but difficult
- `4`: Correct response, after some hesitation
- `5`: Perfect response

**Response** (200 OK):
```json
{
  "word_id": 1,
  "next_review_at": "2025-11-14T10:00:00Z",
  "ease_factor": 2.6,
  "interval": 14,
  "repetitions": 4
}
```

**Errors**:
- `400 Bad Request`: Invalid request body or quality value
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Word not found
- `500 Internal Server Error`: Update failed

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request body or parameters
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Rate Limiting

The API implements three tiers of rate limiting:

### Strict Rate Limit (Public Endpoints)
- **Endpoints**: `/auth/register`, `/auth/login`
- **Limit**: 10 requests per minute per IP
- **Headers**:
  - `X-RateLimit-Retry-After`: Time to wait before retrying (seconds)

### Standard Rate Limit (Protected Endpoints)
- **Endpoints**: Most authenticated endpoints
- **Limit**: 100 requests per minute per IP

### Generous Rate Limit (Read Operations)
- **Endpoints**: GET requests for large datasets
- **Limit**: 300 requests per minute per IP

When rate limited, you'll receive:
- **Status Code**: `429 Too Many Requests`
- **Header**: `X-RateLimit-Retry-After: 60`
- **Body**: `{"error": "Rate limit exceeded. Please try again later."}`

---

## Swagger UI

Interactive API documentation is available at:

**Development**: `http://localhost:8080/api/docs`
**Production**: `https://your-domain.com/api/docs`

The Swagger UI provides:
- Interactive API testing
- Request/response examples
- Schema definitions
- Authentication testing

### Generating Swagger Documentation

```bash
# Install swag CLI
go install github.com/swaggo/swag/cmd/swag@latest

# Generate docs
cd backend
swag init -g cmd/api/main.go -o docs

# Start server (docs available at /api/docs)
go run cmd/api/main.go
```

---

## Code Examples

### JavaScript/TypeScript

```typescript
// Login example
async function login(email: string, password: string) {
  const response = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// Authenticated request example
async function getProgress(token: string) {
  const response = await fetch('http://localhost:8080/api/v1/users/progress', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
```

### cURL

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.token')

# Get progress
curl -X GET http://localhost:8080/api/v1/users/progress \
  -H "Authorization: Bearer $TOKEN"

# Analyze word
curl -X POST http://localhost:8080/api/v1/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"word":"kirja","language":"finnish"}'
```

### Python

```python
import requests

# Login
def login(email, password):
    response = requests.post(
        'http://localhost:8080/api/v1/auth/login',
        json={'email': email, 'password': password}
    )
    response.raise_for_status()
    return response.json()

# Get progress
def get_progress(token):
    response = requests.get(
        'http://localhost:8080/api/v1/users/progress',
        headers={'Authorization': f'Bearer {token}'}
    )
    response.raise_for_status()
    return response.json()

# Usage
data = login('user@example.com', 'password')
token = data['token']
progress = get_progress(token)
print(progress)
```

---

## Changelog

### v1.0.0 (2025-11-07)

**Initial Release**
- Authentication endpoints (register, login, me, refresh)
- Universal word analyzer
- Quest system (The Scribe)
- Mind map (The Synapse)
- Content importer (The Lens)
- User progress tracking
- Spaced Repetition System (SRS)
- Rate limiting (3 tiers)
- Security headers

---

## Support

For issues, questions, or contributions:
- **GitHub Issues**: https://github.com/BachirKhiati/lexia/issues
- **Documentation**: See [README.md](README.md)
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)
