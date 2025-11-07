#!/bin/bash

# Synapse Health Check Script
# Tests all health endpoints and system status

BASE_URL="${1:-http://localhost:8080}"

echo "🏥 Synapse Health Check"
echo "======================"
echo "Base URL: $BASE_URL"
echo ""

# Function to check endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected=$3

    echo -n "$name: "
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" $url)

    if [ $STATUS -eq $expected ]; then
        echo "✅ OK (HTTP $STATUS)"
        return 0
    else
        echo "❌ FAILED (HTTP $STATUS, expected $expected)"
        return 1
    fi
}

FAILED=0

# Check health endpoints
check_endpoint "Health" "$BASE_URL/health" 200 || FAILED=$((FAILED+1))
check_endpoint "Ready" "$BASE_URL/ready" 200 || FAILED=$((FAILED+1))
check_endpoint "Live" "$BASE_URL/live" 200 || FAILED=$((FAILED+1))

# Check API docs
check_endpoint "API Docs" "$BASE_URL/api/docs/index.html" 200 || FAILED=$((FAILED+1))

echo ""
echo "======================"

if [ $FAILED -eq 0 ]; then
    echo "✅ All health checks passed!"
    exit 0
else
    echo "❌ $FAILED health check(s) failed"
    exit 1
fi
