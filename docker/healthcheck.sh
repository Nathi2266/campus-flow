#!/bin/sh
# CampusFlow Health Check Script

# Check if application is responding
curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1

if [ $? -eq 0 ]; then
    # Check database connection
    curl -sf http://localhost:8080/actuator/health/database > /dev/null 2>&1
    exit $?
else
    exit 1
fi
