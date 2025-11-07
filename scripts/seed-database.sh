#!/bin/bash

# Synapse Database Seeder Script
# Seeds demo data into the database

set -e

echo "🌱 Synapse Database Seeder"
echo "=========================="
echo ""

# Check if running in Docker or locally
if [ -f /.dockerenv ]; then
    # Running inside Docker container
    echo "Running seeder inside container..."
    ./synapse-seed
else
    # Check if Docker container is running
    if docker ps | grep -q lexia-backend; then
        echo "Running seeder in Docker container..."
        docker exec lexia-backend ./synapse-seed
    else
        echo "❌ Error: lexia-backend container not found"
        echo ""
        echo "Options:"
        echo "  1. Start the backend: docker-compose -f docker-compose.prod.yml up -d"
        echo "  2. Or run locally: cd backend && go run cmd/seed/main.go"
        exit 1
    fi
fi

echo ""
echo "✅ Database seeding complete!"
echo ""
echo "Demo credentials:"
echo "  Email:    demo@synapse.app"
echo "  Password: Demo1234"
