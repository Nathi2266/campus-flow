# CampusFlow - Student Management System

[![Build Status](https://github.com/campusflow/campusflow/actions/workflows/ci.yml/badge.svg)](https://github.com/campusflow/campusflow)
[![codecov](https://codecov.io/gh/campusflow/campusflow/branch/main/graph/badge.svg)](https://codecov.io/gh/campusflow/campusflow)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

CampusFlow is a comprehensive Student Management System for universities, built with Java 21 and Spring Boot 3.

## Features

- **Student Management:** Create, update, delete, and search students
- **Course Management:** Create courses, assign lecturers, manage capacity
- **Enrollment System:** Enroll students in courses, track enrollment status
- **Reporting:** Generate statistics, graduation progress, course analytics
- **Authentication:** JWT-based authentication with refresh tokens
- **Authorization:** Role-based access control (Admin, Lecturer, Student)

## Technology Stack

- **Java:** 21
- **Framework:** Spring Boot 3.2.5
- **Database:** PostgreSQL 15
- **ORM:** Spring Data JPA + Hibernate 6
- **Security:** Spring Security + JWT
- **Build:** Maven 3.9
- **Testing:** JUnit 5 + Mockito + Testcontainers

## Prerequisites

- Java 21 or higher
- Maven 3.8 or higher
- PostgreSQL 15 or higher (or Docker)

## Quick Start

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:5173 (proxies `/api` to Spring Boot on 8080)

### Running with Docker

```bash
# Start the application, database, and frontend
docker-compose -f docker/docker-compose.yml up -d

# Access
# API: http://localhost:8090
# Frontend (compose): http://localhost:5173
# Swagger UI: http://localhost:8090/swagger-ui.html

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop the application
docker-compose -f docker/docker-compose.yml down
```

### Running with Maven (Local Development)

```bash
# Start PostgreSQL (using Docker)
docker run -d -p 5432:5432 \
  -e POSTGRES_DB=campusflow \
  -e POSTGRES_USER=campusflow \
  -e POSTGRES_PASSWORD=campusflow123 \
  --name campusflow-postgres \
  postgres:15-alpine

# Run database migrations (Flyway runs automatically)
# Build the application
mvn clean package

# Run the application
mvn spring-boot:run

# Access the application
# API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| SPRING_PROFILES_ACTIVE | dev | Spring profile (dev, prod) |
| SERVER_PORT | 8080 | Application port |
| SPRING_DATASOURCE_URL | jdbc:postgresql://localhost:5432/campusflow | Database URL |
| SPRING_DATASOURCE_USERNAME | campusflow | Database username |
| SPRING_DATASOURCE_PASSWORD | campusflow123 | Database password |
| SPRING_JPA_HIBERNATE_DDL_AUTO | validate | Hibernate DDL mode |

## API Documentation

Once the application is running, access the interactive API documentation at:

- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON:** `http://localhost:8080/v3/api-docs`

## Project Structure

```
campusflow/
├── src/
│   ├── main/
│   │   ├── java/com/campusflow/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── domain/          # Domain entities
│   │   │   │   ├── enums/       # Enumerations
│   │   │   │   └── audit/       # Audit classes
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   ├── request/     # Request DTOs
│   │   │   │   ├── response/    # Response DTOs
│   │   │   │   └── mapper/      # MapStruct mappers
│   │   │   ├── repository/      # JPA Repositories
│   │   │   ├── service/         # Business logic
│   │   │   ├── web/             # REST Controllers
│   │   │   │   ├── api/         # API controllers
│   │   │   │   └── exception/   # Exception handlers
│   │   │   └── security/        # Security classes
│   │   └── resources/
│   │       ├── application.yml  # Main configuration
│   │       ├── application-dev.yml  # Development profile
│   │       ├── application-prod.yml # Production profile
│   │       └── db/migration/    # Flyway migrations
│   └── test/
│       └── java/com/campusflow/
│           └── service/         # Service tests
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── healthcheck.sh
└── pom.xml
```

## Development

### Building the Application

```bash
mvn clean package
```

### Running Tests

```bash
mvn test
```

### Running with Test Coverage

```bash
mvn test jacoco:report
```

### Code Quality Checks

```bash
mvn clean verify
```

## Deployment

### Building Docker Image

```bash
docker build -t campusflow:latest .
```

### Running in Production

```bash
docker run -d -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=your-production-db-url \
  -e SPRING_DATASOURCE_USERNAME=your-username \
  -e SPRING_DATASOURCE_PASSWORD=your-password \
  --name campusflow \
  campusflow:latest
```

## Contributing

We welcome contributions! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
