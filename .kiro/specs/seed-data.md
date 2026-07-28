# CampusFlow Seed Data

## Overview

Seed data for initial database setup and development/testing purposes.

## Data Files

### 1. departments.sql
```sql
-- Insert departments
INSERT INTO departments (name, description, created_at, updated_at)
VALUES 
    ('Computer Science', 'Department of Computer Science and Engineering', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Mathematics', 'Department of Mathematics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Physics', 'Department of Physics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Chemistry', 'Department of Chemistry', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Biology', 'Department of Biology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Set sequence to highest ID
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));
```

### 2. users.sql
```sql
-- Insert users
-- Password: Demo123! (BCrypt hash)

-- Admin User
INSERT INTO users (email, password_hash, first_name, last_name, role, created_at, updated_at)
VALUES (
    'admin@campusflow.edu',
    '$2a$12$123456789012345678901uYW5J1k8zQW8zQW8zQW8zQW8zQW8zQW8',
    'System',
    'Admin',
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Lecturer Users
INSERT INTO users (email, password_hash, first_name, last_name, role, department_id, created_at, updated_at)
VALUES (
    'lecturer1@campusflow.edu',
    '$2a$12$123456789012345678901uYW5J1k8zQW8zQW8zQW8zQW8zQW8zQW8',
    'John',
    'Lecturer',
    'LECTURER',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'lecturer2@campusflow.edu',
    '$2a$12$123456789012345678901uYW5J1k8zQW8zQW8zQW8zQW8zQW8zQW8',
    'Jane',
    'Professor',
    'LECTURER',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Student Users
INSERT INTO users (email, password_hash, first_name, last_name, role, department_id, created_at, updated_at)
VALUES (
    'student1@campusflow.edu',
    '$2a$12$123456789012345678901uYW5J1k8zQW8zQW8zQW8zQW8zQW8zQW8',
    'John',
    'Student',
    'STUDENT',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'student2@campusflow.edu',
    '$2a$12$123456789012345678901uYW5J1k8zQW8zQW8zQW8zQW8zQW8zQW8',
    'Jane',
    'Smith',
    'STUDENT',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'student3@campusflow.edu',
    '$2a$12$123456789012345678901uYW5J1k8zQW8zQW8zQW8zQW8zQW8zQW8',
    'Bob',
    'Johnson',
    'STUDENT',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'student4@campusflow.edu',
    '$2a$12$123456789012345678901uYW5J1k8zQW8zQW8zQW8zQW8zQW8zQW8',
    'Alice',
    'Williams',
    'STUDENT',
    2,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'student5@campusflow.edu',
    '$2a$12$123456789012345678901uYW5J1k8zQW8zQW8zQW8zQW8zQW8zQW8',
    'Charlie',
    'Brown',
    'STUDENT',
    2,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Set sequence to highest ID
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
```

### 3. students.sql
```sql
-- Insert students
INSERT INTO students (user_id, student_number, first_name, last_name, enrollment_date, academic_status, created_at, updated_at)
VALUES (
    (SELECT id FROM users WHERE email = 'student1@campusflow.edu'),
    '2024001',
    'John',
    'Student',
    '2024-01-15',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM users WHERE email = 'student2@campusflow.edu'),
    '2024002',
    'Jane',
    'Smith',
    '2024-01-15',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM users WHERE email = 'student3@campusflow.edu'),
    '2024003',
    'Bob',
    'Johnson',
    '2024-01-15',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM users WHERE email = 'student4@campusflow.edu'),
    '2024004',
    'Alice',
    'Williams',
    '2024-01-15',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM users WHERE email = 'student5@campusflow.edu'),
    '2024005',
    'Charlie',
    'Brown',
    '2024-01-15',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Set sequence to highest ID
SELECT setval('students_id_seq', (SELECT MAX(id) FROM students));
```

### 4. courses.sql
```sql
-- Insert courses
INSERT INTO courses (code, name, description, credits, department_id, lecturer_id, max_capacity, active, created_at, updated_at)
VALUES (
    'CS101',
    'Introduction to Programming',
    'Introduction to programming fundamentals using Python',
    3,
    1,
    (SELECT id FROM users WHERE email = 'lecturer1@campusflow.edu'),
    30,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'CS201',
    'Data Structures',
    'Intermediate data structures and algorithms',
    4,
    1,
    (SELECT id FROM users WHERE email = 'lecturer2@campusflow.edu'),
    25,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'MATH101',
    'Calculus I',
    'Introduction to differential and integral calculus',
    4,
    2,
    (SELECT id FROM users WHERE email = 'lecturer1@campusflow.edu'),
    35,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'PHYS101',
    'Physics I',
    'Introduction to mechanics and thermodynamics',
    4,
    3,
    (SELECT id FROM users WHERE email = 'lecturer2@campusflow.edu'),
    30,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'CHEM101',
    'Chemistry I',
    'Introduction to general chemistry',
    3,
    4,
    (SELECT id FROM users WHERE email = 'lecturer1@campusflow.edu'),
    28,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Set sequence to highest ID
SELECT setval('courses_id_seq', (SELECT MAX(id) FROM courses));
```

### 5. enrollments.sql
```sql
-- Insert enrollments
INSERT INTO enrollments (student_id, course_id, enrollment_date, status, created_at, updated_at)
VALUES (
    (SELECT id FROM students WHERE student_number = '2024001'),
    (SELECT id FROM courses WHERE code = 'CS101'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM students WHERE student_number = '2024001'),
    (SELECT id FROM courses WHERE code = 'MATH101'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM students WHERE student_number = '2024001'),
    (SELECT id FROM courses WHERE code = 'PHYS101'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM students WHERE student_number = '2024002'),
    (SELECT id FROM courses WHERE code = 'CS101'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM students WHERE student_number = '2024002'),
    (SELECT id FROM courses WHERE code = 'CS201'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM students WHERE student_number = '2024003'),
    (SELECT id FROM courses WHERE code = 'MATH101'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM students WHERE student_number = '2024003'),
    (SELECT id FROM courses WHERE code = 'PHYS101'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM students WHERE student_number = '2024004'),
    (SELECT id FROM courses WHERE code = 'CHEM101'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM students WHERE student_number = '2024005'),
    (SELECT id FROM courses WHERE code = 'CS101'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Set sequence to highest ID
SELECT setval('enrollments_id_seq', (SELECT MAX(id) FROM enrollments));
```

### 6. audit_logs.sql
```sql
-- Insert sample audit logs
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at)
VALUES 
    (
        (SELECT id FROM users WHERE email = 'admin@campusflow.edu'),
        'USER_CREATED',
        'STUDENT',
        (SELECT id FROM students WHERE student_number = '2024001'),
        '{"firstName":"John","lastName":"Student","email":"student1@campusflow.edu"}',
        CURRENT_TIMESTAMP
    ),
    (
        (SELECT id FROM users WHERE email = 'admin@campusflow.edu'),
        'USER_CREATED',
        'STUDENT',
        (SELECT id FROM students WHERE student_number = '2024002'),
        '{"firstName":"Jane","lastName":"Smith","email":"student2@campusflow.edu"}',
        CURRENT_TIMESTAMP
    ),
    (
        (SELECT id FROM users WHERE email = 'lecturer1@campusflow.edu'),
        'COURSE_CREATED',
        'COURSE',
        (SELECT id FROM courses WHERE code = 'CS101'),
        '{"code":"CS101","name":"Introduction to Programming","credits":3}',
        CURRENT_TIMESTAMP
    );
```

## Seed Data Classes

### Java Seed Data Service
```java
@Service
@Slf4j
@RequiredArgsConstructor
public class SeedDataService {
    
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;
    
    @PostConstruct
    public void seedDatabase() {
        log.info("Starting database seeding...");
        
        // Check if data already exists
        if (departmentRepository.count() > 0) {
            log.info("Database already seeded, skipping...");
            return;
        }
        
        // Seed departments
        seedDepartments();
        
        // Seed users
        seedUsers();
        
        // Seed students
        seedStudents();
        
        // Seed courses
        seedCourses();
        
        // Seed enrollments
        seedEnrollments();
        
        log.info("Database seeding completed successfully!");
    }
    
    private void seedDepartments() {
        List<Department> departments = List.of(
            Department.builder().name("Computer Science").description("Department of Computer Science and Engineering").build(),
            Department.builder().name("Mathematics").description("Department of Mathematics").build(),
            Department.builder().name("Physics").description("Department of Physics").build(),
            Department.builder().name("Chemistry").description("Department of Chemistry").build(),
            Department.builder().name("Biology").description("Department of Biology").build()
        );
        
        departmentRepository.saveAll(departments);
        log.info("Seeded {} departments", departments.size());
    }
    
    private void seedUsers() {
        List<User> users = List.of(
            // Admin
            createAdmin(),
            // Lecturers
            createLecturer("lecturer1@campusflow.edu", "John", "Lecturer", 1),
            createLecturer("lecturer2@campusflow.edu", "Jane", "Professor", 1),
            // Students
            createStudent("student1@campusflow.edu", "John", "Student", 1),
            createStudent("student2@campusflow.edu", "Jane", "Smith", 1),
            createStudent("student3@campusflow.edu", "Bob", "Johnson", 1),
            createStudent("student4@campusflow.edu", "Alice", "Williams", 2),
            createStudent("student5@campusflow.edu", "Charlie", "Brown", 2)
        );
        
        userRepository.saveAll(users);
        log.info("Seeded {} users", users.size());
    }
    
    private void seedStudents() {
        List<Student> students = List.of(
            createStudentEntity("student1@campusflow.edu", "2024001"),
            createStudentEntity("student2@campusflow.edu", "2024002"),
            createStudentEntity("student3@campusflow.edu", "2024003"),
            createStudentEntity("student4@campusflow.edu", "2024004"),
            createStudentEntity("student5@campusflow.edu", "2024005")
        );
        
        studentRepository.saveAll(students);
        log.info("Seeded {} students", students.size());
    }
    
    private void seedCourses() {
        Department csDept = departmentRepository.findByName("Computer Science")
            .orElseThrow(() -> new RuntimeException("CS department not found"));
        
        User lecturer1 = userRepository.findByEmail("lecturer1@campusflow.edu")
            .orElseThrow(() -> new RuntimeException("Lecturer1 not found"));
        
        User lecturer2 = userRepository.findByEmail("lecturer2@campusflow.edu")
            .orElseThrow(() -> new RuntimeException("Lecturer2 not found"));
        
        List<Course> courses = List.of(
            createCourse("CS101", "Introduction to Programming", 3, csDept, lecturer1, 30),
            createCourse("CS201", "Data Structures", 4, csDept, lecturer2, 25),
            createCourse("MATH101", "Calculus I", 4, departmentRepository.findByName("Mathematics").orElseThrow(), lecturer1, 35),
            createCourse("PHYS101", "Physics I", 4, departmentRepository.findByName("Physics").orElseThrow(), lecturer2, 30),
            createCourse("CHEM101", "Chemistry I", 3, departmentRepository.findByName("Chemistry").orElseThrow(), lecturer1, 28)
        );
        
        courseRepository.saveAll(courses);
        log.info("Seeded {} courses", courses.size());
    }
    
    private void seedEnrollments() {
        Student student1 = studentRepository.findByStudentNumber("2024001")
            .orElseThrow(() -> new RuntimeException("Student1 not found"));
        
        Course course1 = courseRepository.findByCode("CS101")
            .orElseThrow(() -> new RuntimeException("Course1 not found"));
        
        Course course2 = courseRepository.findByCode("MATH101")
            .orElseThrow(() -> new RuntimeException("Course2 not found"));
        
        List<Enrollment> enrollments = List.of(
            createEnrollment(student1, course1),
            createEnrollment(student1, course2)
        );
        
        enrollmentRepository.saveAll(enrollments);
        log.info("Seeded {} enrollments", enrollments.size());
    }
    
    // Helper methods
    private User createAdmin() {
        return User.builder()
            .email("admin@campusflow.edu")
            .password(passwordEncoder.encode("Demo123!"))
            .firstName("System")
            .lastName("Admin")
            .role(UserRole.ADMIN)
            .build();
    }
    
    private User createLecturer(String email, String firstName, String lastName, Long departmentId) {
        return User.builder()
            .email(email)
            .password(passwordEncoder.encode("Demo123!"))
            .firstName(firstName)
            .lastName(lastName)
            .role(UserRole.LECTURER)
            .department(departmentRepository.findById(departmentId).orElseThrow())
            .build();
    }
    
    private User createStudent(String email, String firstName, String lastName, Long departmentId) {
        return User.builder()
            .email(email)
            .password(passwordEncoder.encode("Demo123!"))
            .firstName(firstName)
            .lastName(lastName)
            .role(UserRole.STUDENT)
            .department(departmentRepository.findById(departmentId).orElseThrow())
            .build();
    }
    
    private Student createStudentEntity(String email, String studentNumber) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return Student.builder()
            .user(user)
            .studentNumber(studentNumber)
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .enrollmentDate(LocalDate.now())
            .academicStatus(AcademicStatus.ACTIVE)
            .build();
    }
    
    private Course createCourse(String code, String name, int credits, Department department, User lecturer, int maxCapacity) {
        return Course.builder()
            .code(code)
            .name(name)
            .description(name + " course description")
            .credits(credits)
            .department(department)
            .lecturer(lecturer)
            .maxCapacity(maxCapacity)
            .active(true)
            .build();
    }
    
    private Enrollment createEnrollment(Student student, Course course) {
        return Enrollment.builder()
            .student(student)
            .course(course)
            .enrollmentDate(OffsetDateTime.now())
            .status(EnrollmentStatus.ACTIVE)
            .build();
    }
}
```

## Testing Seed Data

### Reset Seed Data
```java
@Service
@RequiredArgsConstructor
public class ResetSeedDataService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public void resetAndSeed() {
        // Truncate tables in correct order (respecting foreign keys)
        jdbcTemplate.execute("TRUNCATE TABLE enrollments RESTART IDENTITY CASCADE");
        jdbcTemplate.execute("TRUNCATE TABLE courses RESTART IDENTITY CASCADE");
        jdbcTemplate.execute("TRUNCATE TABLE students RESTART IDENTITY CASCADE");
        jdbcTemplate.execute("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
        jdbcTemplate.execute("TRUNCATE TABLE departments RESTART IDENTITY CASCADE");
        
        // Re-seed
        seedDepartments();
        seedUsers();
        seedStudents();
        seedCourses();
        seedEnrollments();
    }
}
```

## Data Migration

### Production Migration
```bash
# Export production data
pg_dump -h prod-db.example.com -U campusflow -t departments -t users -t students -t courses -t enrollments campusflow > production-data.sql

# Import to development
psql -h localhost -U campusflow -d campusflow_dev < production-data.sql
```

## Related Specs

- Database: `database-schema.md`
- Architecture: `campusflow-architecture.md`
