# CampusFlow Database Schema

## Overview

- **Database:** PostgreSQL 15+
- **Migration Tool:** Flyway
- **ORM:** Hibernate 6 (Spring Data JPA)
- **Schema Versioning:** Flyway migrations

## Database Design Principles

1. **Third Normal Form (3NF)** for data integrity
2. **Foreign Key Constraints** with cascading rules
3. **Indexes** for frequently queried columns
4. **Audit Fields** (created_at, updated_at, created_by, updated_by)
5. **Soft Deletes** with active flag where appropriate
6. **Data Type Consistency** across all tables

## Entity-Relationship Diagram

```
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│   Department    │        │      User       │        │     Student     │
├─────────────────┤        ├─────────────────┤        ├─────────────────┤
│ id (PK)         │◄───────┤ id (PK)         │        │ id (PK)         │
│ name            │        │ email (UK)      │        │ student_number  │
│ description     │        │ password_hash   │        │ first_name      │
│ created_at      │        │ first_name      │        │ last_name       │
│ updated_at      │        │ last_name       │        │ enrollment_date │
│ created_by      │        │ role            │        │ academic_status │
│ updated_by      │        │ department_id   │        │ gpa             │
└─────────────────┘        │ phone           │        │ graduation_date │
                           │ created_at      │        │ created_at      │
                           │ updated_at      │        │ updated_at      │
                           │ created_by      │        │ created_by      │
                           │ updated_by      │        │ updated_by      │
                           └─────────────────┘        └─────────────────┘
                                     │
                                     │
                           ┌─────────┴──────────────┐
                           │                        │
                           │                        │
                    ┌──────▼───────┐        ┌──────▼───────┐
                    │   Course     │        │  Enrollment  │
                    ├──────────────┤        ├──────────────┤
                    │ id (PK)      │        │ id (PK)      │
                    │ code (UK)    │        │ student_id   │
                    │ name         │        │ course_id    │
                    │ description  │        │ enrollment_date│
                    │ credits      │        │ status       │
                    │ department_id│        │ created_at   │
                    │ lecturer_id  │        │ updated_at   │
                    │ max_capacity │        │ created_by   │
                    │ active       │        │ updated_by   │
                    │ created_at   │        └──────────────┘
                    │ updated_at   │
                    │ created_by   │
                    │ updated_by   │
                    └──────────────┘
```

## Table Definitions

### 1. departments

```sql
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

CREATE INDEX idx_departments_name ON departments(name);
```

### 2. users

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    department_id BIGINT REFERENCES departments(id),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_role ON users(role);
```

### 3. students

```sql
CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    student_number VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    enrollment_date DATE NOT NULL,
    academic_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    gpa DECIMAL(3, 2),
    graduation_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

CREATE INDEX idx_students_student_number ON students(student_number);
CREATE INDEX idx_students_academic_status ON students(academic_status);
```

### 4. courses

```sql
CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL,
    department_id BIGINT NOT NULL REFERENCES departments(id),
    lecturer_id BIGINT REFERENCES users(id),
    max_capacity INTEGER NOT NULL DEFAULT 30,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_courses_department ON courses(department_id);
CREATE INDEX idx_courses_lecturer ON courses(lecturer_id);
CREATE INDEX idx_courses_active ON courses(active);
```

### 5. enrollments

```sql
CREATE TABLE enrollments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    grade VARCHAR(5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE UNIQUE INDEX uq_enrollment_student_course ON enrollments(student_id, course_id);
```

### 6. audit_logs

```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

### 7. tokens (for refresh tokens)

```sql
CREATE TABLE tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    token_type VARCHAR(20) NOT NULL DEFAULT 'ACCESS',
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expired BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by BIGINT REFERENCES users(id),
    updated_by BIGINT REFERENCES users(id)
);

CREATE INDEX idx_tokens_user ON tokens(user_id);
CREATE INDEX idx_tokens_token ON tokens(token);
CREATE INDEX idx_tokens_expires ON tokens(expires_at);
```

## Indexing Strategy

### Primary Key Indexes
- All tables have `BIGSERIAL` primary keys with automatic B-tree indexes

### Foreign Key Indexes
- `users.department_id`
- `students.user_id`
- `courses.department_id`
- `courses.lecturer_id`
- `enrollments.student_id`
- `enrollments.course_id`

### Query Optimization Indexes
- `users.email` - authentication queries
- `students.student_number` - student lookup
- `courses.code` - course lookup
- `enrollments.student_id, course_id` - enrollment existence checks
- `audit_logs.created_at` - audit log queries

## Foreign Key Constraints

### Cascade Deletes
- `students.user_id` → `users.id` (ON DELETE CASCADE) - delete user also deletes student record

### Restrict Deletes
- Most foreign keys use default RESTRICT behavior to prevent accidental data loss

## Data Types

| Column Type | PostgreSQL Type | Java Type |
|-------------|-----------------|-----------|
| Primary Key | BIGSERIAL | Long |
| String (short) | VARCHAR(100) | String |
| String (medium) | VARCHAR(255) | String |
| String (long) | TEXT | String |
| Email | VARCHAR(255) | String |
| Boolean | BOOLEAN | Boolean |
| Integer | INTEGER | Integer |
| Decimal | DECIMAL(10, 2) | BigDecimal |
| Date | DATE | LocalDate |
| Timestamp | TIMESTAMP WITH TIME ZONE | OffsetDateTime |
| JSON | JSONB | String/Map |

## Sample Data (Seed)

See `seed-data.md` for detailed seed data.

## Notifications (V6)

```sql
-- users.notify_in_app BOOLEAN NOT NULL DEFAULT TRUE
-- notifications(id, user_id, type, title, body, entity_type, entity_id, read_at, created_at)
```

See `campusflow-notifications.md`.

## Migration Strategy

Flyway under `src/main/resources/db/migration/`:

1. **V1** — initial schema
2. **V2** — seed data
3. **V3** — seed password fix + tokens TEXT
4. **V4** — preferred_theme
5. **V5** — users.active
6. **V6** — notifications + notify_in_app

Each migration is written to be safe for the environments that apply it.
