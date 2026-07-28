# CampusFlow Testing Strategy

## Overview

- **Unit Tests:** JUnit 5, Mockito
- **Integration Tests:** Spring Boot Test, Testcontainers
- **API Tests:** Spring MockMvc, REST Assured (optional)
- **Test Coverage Target:** 95% minimum

## Test Categories

### 1. Unit Tests
- **Purpose:** Test individual methods in isolation
- **Framework:** JUnit 5, Mockito
- **Coverage:** All public methods, edge cases, error conditions

### 2. Integration Tests
- **Purpose:** Test component interactions and database operations
- **Framework:** Spring Boot Test, Testcontainers
- **Coverage:** Repository operations, service layer with database

### 3. Controller Tests
- **Purpose:** Test API endpoints and request/response handling
- **Framework:** Spring Boot Test, MockMvc
- **Coverage:** All endpoints, authentication, authorization, validation

### 4. Security Tests
- **Purpose:** Test authentication and authorization
- **Framework:** Spring Security Test
- **Coverage:** JWT tokens, role-based access, permission checks

### 5. Integration Flow Tests
- **Purpose:** Test complete user workflows
- **Framework:** Spring Boot Test, Testcontainers
- **Coverage:** End-to-end user scenarios

## Test Structure

```
src/test/
├── java/
│   └── com/
│       └── campusflow/
│           ├── CampusFlowApplicationTests.java
│           ├── unit/
│           │   ├── service/
│           │   │   ├── StudentServiceTest.java
│           │   │   ├── CourseServiceTest.java
│           │   │   └── EnrollmentServiceTest.java
│           │   ├── repository/
│           │   │   └── StudentRepositoryTest.java
│           │   └── util/
│           │       └── JwtTokenProviderTest.java
│           ├── integration/
│           │   ├── repository/
│           │   │   ├── StudentRepositoryIntegrationTest.java
│           │   │   └── CourseRepositoryIntegrationTest.java
│           │   ├── service/
│           │   │   ├── StudentServiceIntegrationTest.java
│           │   │   └── CourseServiceIntegrationTest.java
│           │   └── api/
│           │       ├── AuthControllerIntegrationTest.java
│           │       ├── StudentControllerIntegrationTest.java
│           │       └── CourseControllerIntegrationTest.java
│           ├── security/
│           │   ├── JwtAuthenticationIntegrationTest.java
│           │   └── RoleAuthorizationIntegrationTest.java
│           └── util/
│               ├── TestEntityFactory.java
│               └── TestTokenProvider.java
└── resources/
    ├── application-test.yml
    └── db/
        └── migration/
            └── V1__test_data.sql
```

## Unit Test Examples

### Student Service Unit Test
```java
@ExtendWith(MockitoExtension.class)
class StudentServiceTest {
    
    @Mock
    private StudentRepository studentRepository;
    
    @Mock
    private EnrollmentRepository enrollmentRepository;
    
    @InjectMocks
    private StudentService studentService;
    
    @Test
    void testCreateStudent_Success() {
        // Given
        StudentCreateRequest request = StudentCreateRequest.builder()
            .email("john.doe@campusflow.edu")
            .firstName("John")
            .lastName("Doe")
            .departmentId(1L)
            .build();
        
        when(studentRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(studentRepository.save(any())).thenReturn(createStudentEntity());
        
        // When
        StudentResponse response = studentService.createStudent(request);
        
        // Then
        assertNotNull(response);
        assertEquals("John", response.getFirstName());
        assertEquals("Doe", response.getLastName());
        verify(studentRepository).findByEmail(anyString());
        verify(studentRepository).save(any());
    }
    
    @Test
    void testCreateStudent_EmailAlreadyExists() {
        // Given
        StudentCreateRequest request = StudentCreateRequest.builder()
            .email("existing@campusflow.edu")
            .firstName("John")
            .lastName("Doe")
            .departmentId(1L)
            .build();
        
        when(studentRepository.findByEmail(anyString()))
            .thenReturn(Optional.of(createStudentEntity()));
        
        // When & Then
        assertThrows(EmailAlreadyUsedException.class, 
            () -> studentService.createStudent(request));
        
        verify(studentRepository, never()).save(any());
    }
    
    @Test
    void testCreateStudent_ValidationFailed() {
        // Given
        StudentCreateRequest request = StudentCreateRequest.builder()
            .email("invalid-email")
            .firstName("")
            .lastName("")
            .departmentId(null)
            .build();
        
        // When & Then
        assertThrows(ValidationException.class,
            () -> studentService.createStudent(request));
    }
}
```

### Repository Unit Test
```java
@ExtendWith(MockitoExtension.class)
class StudentRepositoryTest {
    
    @Mock
    private EntityManager entityManager;
    
    @InjectMocks
    private StudentRepository studentRepository;
    
    @Test
    void testFindByDepartmentId() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<Student> result = studentRepository.findByDepartmentId(1L, pageable);
        
        // Then
        assertNotNull(result);
        assertTrue(result.getContent().size() <= 10);
    }
}
```

## Integration Test Examples

### Student Service Integration Test
```java
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Transactional
class StudentServiceIntegrationTest {
    
    @Autowired
    private StudentService studentService;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @BeforeEach
    void setUp() {
        Department department = departmentRepository.save(
            Department.builder().name("Computer Science").build()
        );
    }
    
    @Test
    void testCreateStudent_FullFlow() {
        // Given
        StudentCreateRequest request = StudentCreateRequest.builder()
            .email("test.student@campusflow.edu")
            .firstName("Test")
            .lastName("Student")
            .departmentId(1L)
            .build();
        
        // When
        StudentResponse response = studentService.createStudent(request);
        
        // Then
        assertNotNull(response.getId());
        assertEquals("Test", response.getFirstName());
        assertEquals("Student", response.getLastName());
        assertEquals("test.student@campusflow.edu", response.getEmail());
        assertEquals(1L, response.getDepartmentId());
    }
    
    @Test
    void testCreateStudent_DuplicateEmail() {
        // Given
        StudentCreateRequest request1 = StudentCreateRequest.builder()
            .email("duplicate@campusflow.edu")
            .firstName("First")
            .lastName("Last")
            .departmentId(1L)
            .build();
        
        StudentCreateRequest request2 = StudentCreateRequest.builder()
            .email("duplicate@campusflow.edu")
            .firstName("Second")
            .lastName("User")
            .departmentId(1L)
            .build();
        
        studentService.createStudent(request1);
        
        // When & Then
        assertThrows(EmailAlreadyUsedException.class,
            () -> studentService.createStudent(request2));
    }
}
```

### API Controller Integration Test
```java
@SpringBootTest
@AutoConfigureMockMvc
class StudentControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Test
    void testListStudents_Success() throws Exception {
        // Given
        String accessToken = generateAccessToken("ADMIN");
        
        // When & Then
        mockMvc.perform(get("/api/v1/students")
                .header("Authorization", "Bearer " + accessToken)
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.page").value(0))
            .andExpect(jsonPath("$.size").value(10));
    }
    
    @Test
    void testListStudents_Unauthorized() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/v1/students"))
            .andExpect(status().isUnauthorized());
    }
    
    @Test
    void testListStudents_InvalidToken() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/v1/students")
                .header("Authorization", "Bearer invalid-token"))
            .andExpect(status().isUnauthorized());
    }
    
    @Test
    void testCreateStudent_Success() throws Exception {
        // Given
        String accessToken = generateAccessToken("ADMIN");
        StudentCreateRequest request = StudentCreateRequest.builder()
            .email("new.student@campusflow.edu")
            .firstName("New")
            .lastName("Student")
            .departmentId(1L)
            .build();
        
        // When & Then
        mockMvc.perform(post("/api/v1/students")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.email").value("new.student@campusflow.edu"));
    }
}
```

## Security Test Examples

### JWT Authentication Test
```java
@SpringBootTest
@AutoConfigureMockMvc
class JwtAuthenticationIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Test
    void testLogin_Success() throws Exception {
        // Given
        User user = User.builder()
            .email("test@campusflow.edu")
            .password(passwordEncoder.encode("SecurePass123!"))
            .role(UserRole.STUDENT)
            .build();
        
        // When & Then
        LoginRequest request = LoginRequest.builder()
            .email("test@campusflow.edu")
            .password("SecurePass123!")
            .build();
        
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.refreshToken").isNotEmpty())
            .andExpect(jsonPath("$.user.role").value("STUDENT"));
    }
    
    @Test
    void testLogin_InvalidCredentials() throws Exception {
        // Given
        LoginRequest request = LoginRequest.builder()
            .email("test@campusflow.edu")
            .password("wrong-password")
            .build();
        
        // When & Then
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized());
    }
}
```

### Role Authorization Test
```java
@SpringBootTest
@AutoConfigureMockMvc
class RoleAuthorizationIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testCreateStudent_AdminOnly() throws Exception {
        // Given
        String adminToken = generateToken("ADMIN");
        String studentToken = generateToken("STUDENT");
        StudentCreateRequest request = StudentCreateRequest.builder()
            .email("new@campusflow.edu")
            .firstName("New")
            .lastName("Student")
            .departmentId(1L)
            .build();
        
        // When & Then - Admin can create
        mockMvc.perform(post("/api/v1/students")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated());
        
        // When & Then - Student cannot create
        mockMvc.perform(post("/api/v1/students")
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }
}
```

## Test Coverage Requirements

### Coverage by Layer

| Layer | Minimum Coverage | Tests |
|-------|-----------------|-------|
| Controllers | 90% | Auth, CRUD, Validation, Errors |
| Services | 95% | Business logic, edge cases, exceptions |
| Repositories | 80% | CRUD operations, queries |
| Utilities | 100% | All methods, edge cases |
| Security | 95% | Authentication, authorization, filters |

### Coverage by Feature

| Feature | Coverage Target |
|---------|-----------------|
| Authentication | 100% |
| Authorization | 100% |
| Student Management | 95% |
| Course Management | 95% |
| Enrollment | 95% |
| Reporting | 90% |

## Test Data Management

### Test Entity Factory
```java
@Component
public class TestEntityFactory {
    
    public User createUser(String email, UserRole role) {
        return User.builder()
            .email(email)
            .password(passwordEncoder.encode("TestPass123!"))
            .firstName("Test")
            .lastName("User")
            .role(role)
            .build();
    }
    
    public Department createDepartment(String name) {
        return Department.builder()
            .name(name)
            .description("Test department")
            .build();
    }
    
    public Student createStudent(User user, Department department) {
        return Student.builder()
            .user(user)
            .studentNumber("2024" + (int)(Math.random() * 10000))
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .department(department)
            .enrollmentDate(LocalDate.now())
            .academicStatus(AcademicStatus.ACTIVE)
            .build();
    }
}
```

### Test Token Provider
```java
@Component
public class TestTokenProvider {
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    public String generateToken(User user, String role) {
        return jwtTokenProvider.generateToken(user.getId(), 
            user.getEmail(), role, user.getDepartmentId());
    }
    
    public String generateAdminToken() {
        return generateToken(createAdminUser(), "ADMIN");
    }
    
    public String generateStudentToken() {
        return generateToken(createStudentUser(), "STUDENT");
    }
    
    private User createAdminUser() {
        return User.builder()
            .email("admin@campusflow.edu")
            .role(UserRole.ADMIN)
            .build();
    }
    
    private User createStudentUser() {
        return User.builder()
            .email("student@campusflow.edu")
            .role(UserRole.STUDENT)
            .build();
    }
}
```

## Database Testing with Testcontainers

```java
@Testcontainers
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class DatabaseIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgresContainer = 
        new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("campusflow_test")
            .withUsername("test")
            .withPassword("test");
    
    @DynamicPropertySource
    static void configureTestProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgresContainer::getJdbcUrl);
        registry.add("spring.datasource.username", postgresContainer::getUsername);
        registry.add("spring.datasource.password", postgresContainer::getPassword);
    }
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Test
    void testStudentRepository_Integration() {
        // Test implementation
    }
}
```

## CI/CD Integration

### Maven Build
```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
        <execution>
            <id>check</id>
            <phase>verify</phase>
            <goals>
                <goal>check</goal>
            </goals>
            <configuration>
                <rules>
                    <rule>
                        <element>PACKAGE</element>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.95</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

### GitHub Actions
```yaml
name: Java CI

on:
  push:
    branches: [ main, develop ]
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
      - name: Run tests and check coverage
        run: mvn test jacoco:report
```

## Test Best Practices

1. **Arrange-Act-Assert pattern** for all tests
2. ** meaningful test names** using `methodUnderTest_condition_expectedResult` format
3. **Test one thing per test** method
4. **Use constants** for expected values
5. **Mock external dependencies** in unit tests
6. **Use Testcontainers** for database integration tests
7. **Clean up test data** after tests
8. **Use @DirtiesContext** when necessary
9. **Test edge cases** and error conditions
10. **Maintain test isolation** - tests should not depend on each other

## Related Specs

- Architecture: `campusflow-architecture.md`
- Backend Java: `backend-java.md`
- Database: `database-schema.md`
- API: `api-specification.yaml`
- Security: `security-implementation.md`
