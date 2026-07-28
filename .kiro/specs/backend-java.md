# Backend Java Specification - CampusFlow

## Stack

Spring Boot 3, Spring Security, Spring Data JPA, Hibernate 6, PostgreSQL, Flyway, MapStruct, Bean Validation (JSR-380), Lombok, JUnit 5, Mockito, Testcontainers.

## Project Structure

```
campusflow/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── campusflow/
│   │   │           ├── CampusFlowApplication.java
│   │   │           ├── config/           # Configuration classes
│   │   │           │   ├── CacheConfig.java
│   │   │           │   ├── SecurityConfig.java
│   │   │           │   ├── WebConfig.java
│   │   │           │   ├── JpaConfig.java
│   │   │           │   └── ObjectMapperConfig.java
│   │   │           ├── domain/           # Domain entities
│   │   │           │   ├── Student.java
│   │   │           │   ├── Course.java
│   │   │           │   ├── Enrollment.java
│   │   │           │   ├── User.java
│   │   │           │   ├── Department.java
│   │   │           │   └── audit/
│   │   │           │       └── AuditBase.java
│   │   │           ├── dto/              # Data Transfer Objects
│   │   │           │   ├── request/
│   │   │           │   ├── response/
│   │   │           │   └── mapper/
│   │   │           │       └── StudentMapper.java
│   │   │           ├── repository/       # JPA Repositories
│   │   │           │   ├── StudentRepository.java
│   │   │           │   ├── CourseRepository.java
│   │   │           │   ├── EnrollmentRepository.java
│   │   │           │   ├── UserRepository.java
│   │   │           │   └── DepartmentRepository.java
│   │   │           ├── service/          # Business logic
│   │   │           │   ├── StudentService.java
│   │   │           │   ├── CourseService.java
│   │   │           │   ├── EnrollmentService.java
│   │   │           │   ├── AuthService.java
│   │   │           │   └── ReportService.java
│   │   │           ├── web/              # REST Controllers
│   │   │           │   ├── api/
│   │   │           │   │   ├── StudentController.java
│   │   │           │   │   ├── CourseController.java
│   │   │           │   │   ├── EnrollmentController.java
│   │   │           │   │   ├── AuthController.java
│   │   │           │   │   └── ReportController.java
│   │   │           │   ├── exception/
│   │   │           │   │   ├── GlobalExceptionHandler.java
│   │   │           │   │   ├── ErrorResponse.java
│   │   │           │   │   └── ValidationExceptionHandler.java
│   │   │           │   └── filter/
│   │   │           │       └── JwtAuthenticationFilter.java
│   │   │           └── util/             # Utility classes
│   │   │               ├── DateUtils.java
│   │   │               ├── ValidationUtils.java
│   │   │               └── SecurityUtils.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/
│   │           └── migration/            # Flyway migrations
│   └── test/
│       ├── java/
│       │   └── com/
│       │       └── campusflow/
│       │           ├── service/
│       │           ├── repository/
│       │           ├── web/
│       │           └── integration/
│       └── resources/
│           └── application-test.yml
├── pom.xml
└── README.md
```

## Package Structure Rules

- All Java files in `src/main/java/com/campusflow/`
- Subpackages organized by layer: `config`, `domain`, `dto`, `repository`, `service`, `web`, `util`
- DTOs separated into `dto/request` and `dto/response`
- Mappers in `dto/mapper` package
- Exceptions in `web/exception` package
- Filters and security utilities in `web/filter` package

## Dependency Injection Patterns

- **Constructor injection only** - No field injection
- **Immutable dependencies** with `final` fields
- **No circular dependencies** - Redesign if detected

```java
@Service
public class StudentService {
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final EmailService emailService;
    
    public StudentService(
        StudentRepository studentRepository,
        EnrollmentRepository enrollmentRepository,
        EmailService emailService
    ) {
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.emailService = emailService;
    }
}
```

## Service Layer Patterns

- **@Service** annotation for business logic classes
- **@Transactional** for database operations
- **Interface-based design** for testability
- **Separation of concerns** - Business logic in services, data access in repositories

```java
@Service
@Transactional
public class StudentServiceImpl implements StudentService {
    // Business logic implementation
}
```

## Repository Layer Patterns

- **@Repository** annotation for data access interfaces
- **Spring Data JPA** methods for CRUD operations
- **Custom queries** with `@Query` annotation
- **Pagination support** with `Pageable` parameter

```java
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Page<Student> findByDepartmentId(Long departmentId, Pageable pageable);
    Optional<Student> findByEmail(String email);
    List<Student> findByEnrollmentsCourseId(Long courseId);
}
```

## DTO Patterns

- **Immutable DTOs** where possible
- **Validation annotations** on DTO fields
- **MapStruct** for mapper generation
- **No business logic** in DTOs

```java
@Data
@Builder
public class StudentCreateRequest {
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotNull(message = "Department is required")
    private Long departmentId;
}
```

## Exception Handling Patterns

- **Global Exception Handler** with `@ControllerAdvice`
- **Custom exception classes** for domain errors
- **RFC7807 Problem Details** for error responses
- **Logging** for server errors

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFoundException(NotFoundException ex) {
        ErrorResponse error = ErrorResponse.builder()
            .status(HttpStatus.NOT_FOUND.value())
            .error("Not Found")
            .message(ex.getMessage())
            .timestamp(OffsetDateTime.now())
            .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
```

## Configuration Patterns

- **@Configuration** for configuration classes
- **@Value** for property injection
- **@ConditionalOnProperty** for conditional bean creation
- **Profile-specific configurations**

```java
@Configuration
@EnableCaching
public class CacheConfig {
    @Value("${cache.redis.enabled:true}")
    private boolean redisEnabled;
}
```

## Validation Patterns

- **Bean Validation annotations** on DTOs and entities
- **Custom validators** for complex validation
- **@Valid** and **@Validated** for validation triggering
- **Method validation** with `@Validated` on service classes

```java
@Validated
@Service
public class EnrollmentService {
    public void enrollStudent(
        @NotNull Long studentId,
        @NotNull Long courseId
    ) {
        // Implementation
    }
}
```

## Testing Patterns

- **@SpringBootTest** for integration tests
- **@WebMvcTest** for controller tests
- **@DataJpaTest** for repository tests
- **Mockito** for unit test mocks
- **Testcontainers** for database integration tests

```java
@SpringBootTest
class StudentServiceIntegrationTest {
    @Autowired
    private StudentService studentService;
    
    @Test
    void testCreateStudent() {
        // Test implementation
    }
}
```

## Related Specs

- API contract: `api-specification.yaml`
- Schema: `database-schema.md`
- Security: `security-implementation.md`
- Testing: `testing-strategy.md`
- Performance: `performance-optimization.md`
