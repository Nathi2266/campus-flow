#!/bin/sh
# CampusFlow Health Check Script

curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1
exit $?
