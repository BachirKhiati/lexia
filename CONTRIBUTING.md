# Contributing to Synapse

First off, thank you for considering contributing to Synapse! It's people like you that make Synapse such a great tool for language learning.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

- **Be respectful**: Treat everyone with respect and kindness
- **Be collaborative**: Help others and accept help graciously
- **Be inclusive**: Welcome newcomers and encourage participation
- **Be patient**: Understand that people have different skill levels
- **Focus on what is best**: For the community and the project

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Go 1.21+** - [Download](https://golang.org/dl/)
- **Node.js 20+** - [Download](https://nodejs.org/)
- **Docker & Docker Compose** - [Download](https://www.docker.com/get-started)
- **Git** - [Download](https://git-scm.com/downloads)

### Quick Setup

We provide an automated setup script that handles everything:

```bash
git clone https://github.com/YOUR_USERNAME/synapse.git
cd lexia
./dev-setup.sh
```

This script will:
1. Check for required dependencies
2. Create environment files
3. Install Go and Node.js dependencies
4. Start Docker services (PostgreSQL, Redis)
5. Provide next steps

### Manual Setup

If you prefer to set up manually, see the [README.md](README.md) for detailed instructions.

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/synapse.git
cd lexia

# Add upstream remote
git remote add upstream https://github.com/BachirKhiati/lexia.git
```

### 2. Create a Branch

```bash
# Always create a feature branch from develop
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/fixes

### 3. Set Up Environment

```bash
# Backend environment
cp backend/.env.example backend/.env
# Add your API keys (Claude, Gemini)

# Frontend environment
cp frontend/.env.example frontend/.env
```

### 4. Start Development Servers

**Backend:**
```bash
cd backend
go run cmd/api/main.go
# Runs on http://localhost:8080
```

**Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

**Or use Docker:**
```bash
docker compose up
```

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the bug
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Go version, Node version)

Use the bug report template when creating issues.

### Suggesting Enhancements

Enhancement suggestions are welcome! Please include:

- **Clear use case**: Why is this enhancement needed?
- **Detailed description**: What should it do?
- **Possible implementation**: How might it work?
- **Alternatives considered**: What other solutions exist?

### Pull Requests

1. **Find or create an issue** for what you want to work on
2. **Comment on the issue** to let others know you're working on it
3. **Follow the development workflow** (see above)
4. **Write tests** for your changes
5. **Update documentation** if needed
6. **Submit a pull request** when ready

## Pull Request Process

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] All tests pass (`go test ./...` and `npm test`)
- [ ] New code has tests
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive
- [ ] Branch is up to date with develop

### Commit Messages

Follow the conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(analyzer): add pronunciation audio to word pop-up

Integrated Forvo API to provide native pronunciation audio
for Finnish words in the Analyzer pop-up.

Closes #123
```

```
fix(auth): resolve token refresh race condition

Fixed issue where simultaneous requests could cause
duplicate token refresh attempts.

Fixes #456
```

### PR Template

When you create a PR, fill out the template with:

- Description of changes
- Related issue number
- Type of change (bugfix, feature, etc.)
- Testing performed
- Screenshots (for UI changes)
- Checklist completion

### Review Process

1. **Automated checks** run (CI/CD pipeline)
2. **Code review** by maintainers
3. **Discussion** and requested changes
4. **Approval** and merge

We aim to review PRs within 48 hours.

## Coding Standards

### Go (Backend)

- Follow [Effective Go](https://golang.org/doc/effective_go)
- Use `gofmt` for formatting
- Use `go vet` to catch common errors
- Run `golangci-lint` for linting
- Write godoc comments for exported functions

```go
// AnalyzeWord performs deep analysis of a word including definition,
// conjugations, and usage examples.
func (s *Service) AnalyzeWord(ctx context.Context, word string, language string) (*models.AnalyzerResponse, error) {
    // Implementation
}
```

- **Error handling**: Always handle errors explicitly
- **Context**: Use context.Context for cancellation
- **Naming**: Use clear, descriptive names (avoid abbreviations)
- **Testing**: Aim for >80% code coverage

### TypeScript/React (Frontend)

- Follow the existing code style
- Use TypeScript strict mode
- Use functional components with hooks
- Use Tailwind CSS for styling (avoid custom CSS)
- Run `npm run lint` to check for issues

```typescript
// Use descriptive function names
const AnalyzerPopup: React.FC<AnalyzerProps> = ({ word, onClose }) => {
  const [definition, setDefinition] = useState<string>('');

  // Use hooks for state and effects
  useEffect(() => {
    fetchDefinition(word);
  }, [word]);

  return (
    // JSX with Tailwind classes
    <div className="fixed inset-0 bg-black bg-opacity-50">
      {/* Content */}
    </div>
  );
};
```

- **Props**: Define interfaces for component props
- **Hooks**: Extract complex logic into custom hooks
- **API calls**: Use React Query for data fetching
- **State**: Keep state close to where it's used

### File Organization

```
backend/
├── cmd/api/              # Main application entry
├── internal/
│   ├── config/          # Configuration
│   ├── handlers/        # HTTP handlers
│   ├── models/          # Data models
│   ├── services/        # Business logic
│   └── middleware/      # HTTP middleware

frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── services/       # API clients
│   ├── hooks/          # Custom React hooks
│   └── types/          # TypeScript types
```

## Testing Guidelines

### Backend Tests

```go
func TestAnalyzeWord(t *testing.T) {
    // Arrange
    service := NewService()
    word := "kirja"
    language := "finnish"

    // Act
    result, err := service.AnalyzeWord(context.Background(), word, language)

    // Assert
    assert.NoError(t, err)
    assert.Equal(t, word, result.Word)
    assert.NotEmpty(t, result.Definition)
}
```

Run tests:
```bash
cd backend
go test ./...                    # All tests
go test -v ./internal/services/  # Specific package
go test -race ./...              # With race detector
go test -cover ./...             # With coverage
```

### Frontend Tests

```typescript
import { render, screen } from '@testing-library/react';
import AnalyzerPopup from './AnalyzerPopup';

test('displays word definition', async () => {
  render(<AnalyzerPopup word="kirja" />);

  const definition = await screen.findByText(/book/i);
  expect(definition).toBeInTheDocument();
});
```

Run tests:
```bash
cd frontend
npm test              # All tests
npm test -- --watch  # Watch mode
npm test -- --coverage # With coverage
```

### Test Coverage

- Aim for **>80% coverage** for new code
- Focus on business logic and critical paths
- Don't chase 100% coverage at the expense of quality

## Documentation

### Code Documentation

- **Go**: Use godoc comments for exported functions
- **TypeScript**: Use JSDoc for complex functions
- **README**: Update if you add new features
- **CHANGELOG**: Add entry for significant changes

### API Documentation

If you modify API endpoints:

1. Update the Swagger/OpenAPI spec
2. Update README.md API section
3. Add examples if helpful

### User Documentation

For user-facing features:

1. Add usage instructions
2. Include screenshots or GIFs
3. Update the appropriate guide (DEPLOYMENT.md, etc.)

## Community

### Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Discord**: (Coming soon) For real-time chat

### Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Thanked in the README

### First-Time Contributors

Look for issues labeled:
- `good first issue` - Great for newcomers
- `help wanted` - We need community help
- `beginner friendly` - Easy to get started

Don't hesitate to ask questions! We're here to help.

## Additional Resources

- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)

---

## Thank You! 🎉

Your contributions make Synapse better for everyone. We appreciate your time and effort!

Happy coding! 🚀
