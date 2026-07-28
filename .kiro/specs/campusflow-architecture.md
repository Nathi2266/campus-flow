# CampusFlow Architecture

## High-level Architecture

```
Browser (React/Vite or Java-based frontend)
        │  /api proxy
        ▼
Spring Boot API (Spring Security + JPA + PostgreSQL)
        │
        ▼
PostgreSQL

Optional: External integrations (LDAP, SSO, Email Service)
```

## Layered Architecture

### 1. Presentation Layer
- **Spring Web MVC Controllers** - REST API endpoints
- **Spring Security Configuration** - Authentication and authorization
- **OpenAPI/Swagger Documentation** - API documentation
- **DTO Mappers** - Request/Response object transformations

### 2. Business Layer
- **Service Classes** - Business logic implementation
- **Domain Services** - Complex business operations
- **Transaction Management** - `@Transactional` for data consistency

### 3. Domain Layer
- **Domain Entities** - Core business objects
- **Value Objects** - Immutable domain objects
- **Domain Events** - Business event notifications
- **Domain Validation** - Business rule enforcement

### 4. Persistence Layer
- **JPA Repositories** - Data access interfaces
- **Entity Managers** - Database operations
- **Flyway Migrations** - Database schema versioning

### 5. Security Layer
- **JWT Token Processing** - Authentication tokens
- **Role-Based Access Control** - `@PreAuthorize`, `@PostAuthorize`
- **Password Encoding** - BCrypt hashing

### 6. Configuration Layer
- **Application Properties** - `application.yml`, profiles
- **Security Configuration** - Spring Security setup
- **Database Configuration** - DataSource, JPA settings

### 7. Exception Layer
- **Global Exception Handler** - `@ControllerAdvice`
- **Custom Exceptions** - Domain-specific exceptions
- **Problem Details (RFC7807)** - Standardized error responses

### 8. Utility Layer
- **Date/Time Utilities** - Date handling
- **Validation Utilities** - Custom validators
- **Mapper Utilities** - Object mapping with MapStruct

### 9. Common Layer
- **Common DTOs** - Reusable response structures
- **Common Constants** - Application constants
- **Common Exceptions** - Reusable exception classes

## Design Intent

- **Department-scoped multi-tenancy** - Soft tenancy via `department_id`
- **Role-based capabilities** with server-side enforcement
- **Student lifecycle management** as the product heartbeat
- **Audit trail** for accountability and compliance

## Technology Stack Alignment

| AEOS Pattern | Java Spring Boot Implementation |
|--------------|---------------------------------|
| Frontend | Spring Boot with Thymeleaf or standalone React |
| API Client | Spring Web MVC Controllers with DTOs |
| Application API | Spring Service Layer with `@Service` |
| Persistence | Spring Data JPA with `@Repository` |
| Database | PostgreSQL with Flyway migrations |

## AEOS Dependency

Agents and engineers treat `.kiro/specs/` as the product source of truth and `.kiro/project/` as implementation decisions. Skills do not redefine architecture facts listed here.

## Scalability Considerations

- **Horizontal scaling** with stateless Spring Boot instances
- **Database connection pooling** with HikariCP
- **Caching strategy** for reports and frequently accessed data
- **Load balancer** for multiple application instances
- **CDN** for static assets

## Security Considerations

- **HTTPS only** in production
- **CSRF protection** for form-based interactions
- **XSS prevention** via proper output encoding
- **SQL injection prevention** via JPA parameterized queries
- **Rate limiting** for authentication endpoints
- **Audit logging** for security-sensitive operations
