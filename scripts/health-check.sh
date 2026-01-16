#!/bin/bash

# Health Check Script
API_URL="${API_URL:-http://localhost:3001}"

# Check if server is responding
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ Server is healthy (HTTP $HTTP_CODE)"
    exit 0
else
    echo "❌ Server is unhealthy (HTTP $HTTP_CODE)"
    exit 1
fi
