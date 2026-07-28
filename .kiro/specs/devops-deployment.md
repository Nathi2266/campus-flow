# CampusFlow DevOps and Deployment

## Overview

- **Containerization:** Docker with multi-stage builds
- **Orchestration:** Docker Compose for local development
- **CI/CD:** GitHub Actions for automated builds and tests
- **Deployment:** Kubernetes (production) or Docker Compose (staging)
- **Monitoring:** Prometheus + Grafana

## Project Structure

```
campusflow/
├── src/
│   └── ...
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── healthcheck.sh
├── scripts/
│   ├── init-db.sh
│   └── wait-for-it.sh
├── kubernetes/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── configmap.yaml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── pom.xml
└── README.md
```

## Dockerfile

### Multi-Stage Build
```dockerfile
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build

# Copy only pom.xml for caching
COPY pom.xml .
RUN mvn -B dependency:go-offline

# Copy source code
COPY src ./src

# Build application
RUN mvn -B clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

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
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD /usr/local/bin/healthcheck || exit 1

# JVM options
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# Start application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### Health Check Script
```bash
#!/bin/sh
# healthcheck.sh

# Check if application is responding
curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1

if [ $? -eq 0 ]; then
    # Check database connection
    curl -sf http://localhost:8080/actuator/health/database > /dev/null 2>&1
    exit $?
else
    exit 1
fi
```

## Docker Compose

### Development Environment
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: campusflow-postgres
    environment:
      POSTGRES_DB: campusflow
      POSTGRES_USER: campusflow
      POSTGRES_PASSWORD: campusflow123
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U campusflow"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - campusflow-network

  app:
    build:
      context: .
      dockerfile: docker/Dockerfile
    container_name: campusflow-app
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/campusflow
      SPRING_DATASOURCE_USERNAME: campusflow
      SPRING_DATASOURCE_PASSWORD: campusflow123
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
      SERVER_PORT: 8080
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - campusflow-network
    restart: unless-stopped

networks:
  campusflow-network:
    driver: bridge

volumes:
  postgres_data:
```

### Production Environment
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: campusflow-prod-postgres
    environment:
      POSTGRES_DB: campusflow
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 30s
      timeout: 10s
      retries: 5
    networks:
      - campusflow-network
    restart: unless-stopped

  app:
    image: campusflow:latest
    container_name: campusflow-prod-app
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/campusflow
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
      SERVER_PORT: 8080
      SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI: ${AUTH_ISSUER_URI}
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - campusflow-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

networks:
  campusflow-network:
    driver: bridge

volumes:
  postgres_data:
```

## CI/CD Pipeline

### GitHub Actions - CI
```yaml
name: Java CI

on:
  push:
    branches: [ main, develop, feature/* ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven
      
      - name: Build with Maven
        run: mvn -B clean package -DskipTests
      
      - name: Run Tests
        run: mvn -B test
      
      - name: Check Code Coverage
        run: |
          mvn jacoco:report
         Coverage=$(cat target/site/jacoco/jacoco.csv | tail -n +2 | cut -d',' -f7 | tr -d '%')
          if [ "$Coverage" -lt 95 ]; then
            echo "Code coverage is below 95%: $Coverage%"
            exit 1
          fi
        exit-code: 1
      
      - name: Upload Coverage Report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: target/site/jacoco/
      
      - name: Build Docker Image
        run: |
          docker build -t campusflow:${{ github.sha }} .
      
      - name: Run Docker Compose Tests
        run: |
          docker-compose -f docker/docker-compose.yml up -d
          sleep 30
          curl -sf http://localhost:8080/actuator/health > /dev/null
          docker-compose -f docker/docker-compose.yml down
```

### GitHub Actions - CD
```yaml
name: CD Pipeline

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven
      
      - name: Build with Maven
        run: mvn -B clean package
      
      - name: Run Tests
        run: mvn -B test
      
      - name: Build Docker Image
        run: docker build -t campusflow:${{ github.sha }} .
      
      - name: Tag Docker Image
        run: |
          docker tag campusflow:${{ github.sha }} campusflow:latest
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Push Docker Images
        run: |
          docker push campusflow:${{ github.sha }}
          docker push campusflow:latest
      
      - name: Deploy to Kubernetes
        if: github.ref == 'refs/heads/main'
        uses: azure/k8s-deploy@v4
        with:
          kubeconfig: ${{ secrets.KUBECONFIG }}
          images: |
            campusflow:${{ github.sha }}
          manifests: |
            kubernetes/deployment.yaml
            kubernetes/service.yaml
            kubernetes/ingress.yaml
          revision: true
```

## Kubernetes Manifests

### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: campusflow
  labels:
    app: campusflow
spec:
  replicas: 3
  selector:
    matchLabels:
      app: campusflow
  template:
    metadata:
      labels:
        app: campusflow
    spec:
      containers:
        - name: campusflow
          image: campusflow:latest
          ports:
            - containerPort: 8080
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: "prod"
            - name: SPRING_DATASOURCE_URL
              valueFrom:
                secretKeyRef:
                  name: campusflow-db
                  key: url
            - name: SPRING_DATASOURCE_USERNAME
              valueFrom:
                secretKeyRef:
                  name: campusflow-db
                  key: username
            - name: SPRING_DATASOURCE_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: campusflow-db
                  key: password
          resources:
            requests:
              cpu: "250m"
              memory: "512Mi"
            limits:
              cpu: "500m"
              memory: "1Gi"
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8080
            initialDelaySeconds: 60
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 5
```

### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: campusflow-service
spec:
  selector:
    app: campusflow
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: ClusterIP
```

### Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: campusflow-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: api.campusflow.edu
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: campusflow-service
                port:
                  number: 80
```

## Monitoring and Logging

### Prometheus Configuration
```yaml
scrape_configs:
  - job_name: 'campusflow'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['campusflow-service:8080']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "CampusFlow Performance",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "http_server_requests_seconds_sum / http_server_requests_seconds_count",
            "legendFormat": "Average Response Time"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "hikaricp_connections_active",
            "legendFormat": "Active Connections"
          }
        ]
      }
    ]
  }
}
```

## Deployment Procedures

### Development
```bash
# Start development environment
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop environment
docker-compose -f docker/docker-compose.yml down
```

### Staging
```bash
# Build and deploy to staging
mvn clean package -DskipTests
docker build -t campusflow:staging .
docker-compose -f docker/docker-compose.staging.yml up -d
```

### Production
```bash
# Production deployment
git checkout main
mvn clean package
docker build -t campusflow:${RELEASE_VERSION} .
docker push campusflow:${RELEASE_VERSION}

# Update Kubernetes deployment
kubectl set image deployment/campusflow campusflow=campusflow:${RELEASE_VERSION}

# Monitor deployment
kubectl rollout status deployment/campusflow
```

## Environment Configuration

### Development
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/campusflow_dev
    username: campusflow
    password: campusflow123
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8081/realms/campusflow
```

### Production
```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${AUTH_ISSUER_URI}
```

## Backup and Recovery

### Database Backup
```bash
# Backup
docker exec campusflow-postgres pg_dump -U campusflow campusflow > backup.sql

# Restore
docker exec -i campusflow-postgres psql -U campusflow -d campusflow < backup.sql
```

### Disaster Recovery
1. Stop application services
2. Restore database from backup
3. Restart application services
4. Verify application health
5. Update monitoring alerts

## Security

### Docker Security
- Use non-root user in container
- Scan images for vulnerabilities
- Use minimal base images
- Rotate secrets regularly
- Enable Docker Content Trust

### Application Security
- Environment variables for secrets
- Secret management (HashiCorp Vault)
- Network policies
- Pod security policies

## Related Specs

- Architecture: `campusflow-architecture.md`
- Testing: `testing-strategy.md`
