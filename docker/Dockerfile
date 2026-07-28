# CampusFlow Dockerfile
# Multi-stage build for production

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build

# Copy source code
COPY pom.xml .
COPY src ./src

# Build application
RUN mvn -B clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user and install curl for healthchecks
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && apk add --no-cache curl

# Copy dependencies and application
COPY --from=builder /build/target/*.jar app.jar

# Health check script
COPY docker/healthcheck.sh /usr/local/bin/healthcheck
RUN chmod +x /usr/local/bin/healthcheck

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
    CMD /usr/local/bin/healthcheck || exit 1

# JVM options
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# Start application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
