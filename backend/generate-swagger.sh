#!/bin/bash
# Swagger Documentation Generator
# This script installs swag CLI (if needed) and generates Swagger documentation

set -e

echo "🔍 Checking for swag CLI..."

# Check if swag is installed
if ! command -v swag &> /dev/null; then
    echo "📦 Installing swag CLI..."
    go install github.com/swaggo/swag/cmd/swag@latest
    echo "✅ swag CLI installed"
else
    echo "✅ swag CLI already installed"
fi

# Ensure swag is in PATH
export PATH=$PATH:$(go env GOPATH)/bin

# Generate swagger docs
echo "📝 Generating Swagger documentation..."
cd "$(dirname "$0")"

swag init -g cmd/api/main.go -o docs --parseDependency --parseInternal

if [ $? -eq 0 ]; then
    echo "✅ Swagger documentation generated successfully!"
    echo ""
    echo "📚 Documentation available at:"
    echo "   - Swagger UI: http://localhost:8080/api/docs"
    echo "   - JSON spec: http://localhost:8080/api/docs/doc.json"
    echo ""
    echo "💡 To start the server:"
    echo "   cd backend && go run cmd/api/main.go"
else
    echo "❌ Failed to generate Swagger documentation"
    exit 1
fi
