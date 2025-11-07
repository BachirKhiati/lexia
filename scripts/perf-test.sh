#!/bin/bash

# Synapse Performance Test Script
# Uses Apache Bench to test endpoint performance

URL="${1:-http://localhost:8080/health}"
REQUESTS="${2:-1000}"
CONCURRENCY="${3:-10}"

echo "⚡ Synapse Performance Test"
echo "=========================="
echo "URL: $URL"
echo "Requests: $REQUESTS"
echo "Concurrency: $CONCURRENCY"
echo ""

# Check if Apache Bench is installed
if ! command -v ab &> /dev/null; then
    echo "❌ Apache Bench (ab) not installed"
    echo "Install with: sudo apt-get install apache2-utils"
    exit 1
fi

# Run test
ab -n $REQUESTS -c $CONCURRENCY $URL

echo ""
echo "=========================="
echo "⚡ Performance test complete"
echo ""
echo "💡 Tips:"
echo "  - Requests/sec should be > 100"
echo "  - Mean response time should be < 100ms"
echo "  - Failed requests should be 0"
