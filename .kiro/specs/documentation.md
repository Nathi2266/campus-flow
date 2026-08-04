# CampusFlow Documentation

## Overview

- **API Documentation:** OpenAPI 3 with Swagger UI
- **User Documentation:** Markdown files
- **Developer Documentation:** Code comments and examples
- **Architecture Documentation:** In `.kiro/specs/`

## Documentation Structure

```
campusflow/
├── README.md
├── docs/
│   ├── user-guide.md
│   ├── api-guide.md
│   ├── architecture.md
│   ├── deployment.md
│   └── troubleshooting.md
├── .kiro/
│   └── specs/
│       ├── campusflow-architecture.md
│       ├── database-schema.md
│       └── ...
└── src/
    └── main/
        └── resources/
            └── static/
                └── swagger/
```

## Documentation Types

### 1. README.md
```markdown
# CampusFlow - Student Management System

[![CI](https://github.com/Nathi2266/campus-flow/actions/workflows/ci.yml/badge.svg)](https://github.com/Nathi2266/campus-flow/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

CampusFlow is a comprehensive Student Management System for universities, built with Java 21 and Spring Boot 3. See the root `README.md` for the live contributor guide.

## Features

- **Student Management:** Create, update, delete, and search students
- **Course Management:** Create courses, assign lecturers, manage capacity
- **Enrollment System:** Enroll students in courses, track enrollment status
- **Reporting:** Generate statistics, graduation progress, course analytics
- **Authentication:** JWT-based authentication with refresh tokens
- **Authorization:** Role-based access control (Admin, Lecturer, Student)

## Architecture

- **Frontend:** React + Vite (optional)
- **Backend:** Spring Boot 3 + Java 21
- **Database:** PostgreSQL 15
- **Security:** JWT + Spring Security
- **Deployment:** Docker + Kubernetes

## Quick Start

### Prerequisites

- Java 21+
- Docker & Docker Compose
- Maven 3.8+

### Running with Docker

```bash
# Start the application and database
docker-compose up -d

# Access the application
# API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Running with Maven

```bash
# Start PostgreSQL
docker-compose -f docker/docker-compose.yml up -d postgres

# Run the application
mvn spring-boot:run
```

## API Documentation

Once the application is running, access the interactive API documentation at:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Configuration

See [Configuration Guide](docs/configuration.md) for environment variables and settings.

## Deployment

See [Deployment Guide](docs/deployment.md) for production deployment instructions.

## Development

See [Developer Guide](docs/developer-guide.md) for setting up development environment.

## Contributing

We welcome contributions! See [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
```

### 2. User Guide

#### docs/user-guide.md
```markdown
# CampusFlow User Guide

## Overview

This guide covers how to use CampusFlow as different user roles.

## User Roles

| Role | Description |
|------|-------------|
| Admin | Full system access, manages users and departments |
| Lecturer | Manages courses, views student enrollments |
| Student | Enrolls in courses, views own information |

## Getting Started

### Registration

1. Navigate to the registration page
2. Fill in your details (email, password, name)
3. Select your role (Admin, Lecturer, or Student)
4. Click "Register"

### Login

1. Navigate to the login page
2. Enter your email and password
3. Click "Login"

## Student Features

### Viewing Profile

1. Click on "Profile" in the navigation menu
2. View your personal information
3. Update your phone number if needed

### Enrolling in Courses

1. Navigate to "Courses"
2. Browse available courses
3. Click "Enroll" on a course
4. Confirm enrollment

### Viewing Courses

1. Navigate to "My Courses"
2. View all enrolled courses
3. View course details and grades

## Lecturer Features

### Managing Courses

1. Navigate to "Courses"
2. Click "Create Course" to add a new course
3. Fill in course details (code, name, credits)
4. Assign students to the course

### Viewing Students

1. Navigate to "Students"
2. View students enrolled in your courses
3. View student performance metrics

## Admin Features

### Managing Departments

1. Navigate to "Departments"
2. Click "Create Department"
3. Fill in department details

### Managing Users

1. Navigate to "Users"
2. Click "Add User"
3. Fill in user details and assign role

### Viewing Reports

1. Navigate to "Reports"
2. Select report type
3. View and export report data

## Frequently Asked Questions

### How do I reset my password?

1. Click "Forgot Password" on the login page
2. Enter your email address
3. Check your email for reset instructions

### How do I update my profile information?

1. Click on "Profile" in the navigation menu
2. Update your information
3. Click "Save Changes"

## Need Help?

Contact your system administrator or submit a support ticket.
```

### 3. API Guide

#### docs/api-guide.md
```markdown
# CampusFlow API Guide

## Overview

This guide provides detailed information about the CampusFlow REST API.

## Base URL

```
http://localhost:8080/api/v1
```

## Authentication

All API endpoints (except authentication endpoints) require a valid JWT access token in the Authorization header.

```http
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT",
  "departmentId": 1
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

### Students

#### List Students
```http
GET /students?page=0&size=20&sort=lastName,asc
Authorization: Bearer <access_token>
```

#### Create Student
```http
POST /students
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "student@campusflow.edu",
  "firstName": "Jane",
  "lastName": "Smith",
  "departmentId": 1
}
```

#### Get Student
```http
GET /students/{id}
Authorization: Bearer <access_token>
```

### Courses

#### List Courses
```http
GET /courses?page=0&size=20&departmentId=1&active=true
Authorization: Bearer <access_token>
```

#### Create Course
```http
POST /courses
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "code": "CS101",
  "name": "Introduction to Programming",
  "credits": 3,
  "departmentId": 1,
  "maxCapacity": 30
}
```

### Enrollments

#### Enroll Student
```http
POST /enrollments
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "studentId": 1,
  "courseId": 1
}
```

### Reports

#### Get Statistics
```http
GET /reports/statistics
Authorization: Bearer <access_token>
```

## Error Handling

### Success Response
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 1,
  "email": "student@campusflow.edu",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Error Response
```http
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid email format",
  "path": "/api/v1/students",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Rate Limiting

The API implements rate limiting:

| Endpoint | Rate Limit |
|----------|------------|
| Authentication | 10 requests/minute |
| Other Endpoints | 100 requests/minute |

## Client Libraries

### JavaScript/TypeScript
```javascript
import CampusFlowClient from '@campusflow/client';

const client = new CampusFlowClient({
  baseUrl: 'http://localhost:8080/api/v1',
  accessToken: 'your-access-token'
});

// List students
const students = await client.students.list({
  page: 0,
  size: 20
});

// Create student
const newStudent = await client.students.create({
  email: 'student@campusflow.edu',
  firstName: 'Jane',
  lastName: 'Smith',
  departmentId: 1
});
```

## Related Documentation

- [User Guide](user-guide.md)
- [Architecture](architecture.md)
- [Deployment](deployment.md)
