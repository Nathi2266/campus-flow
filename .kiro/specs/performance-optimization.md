# CampusFlow Performance Optimization

## Overview

- **Response Time SLA:** <200ms for 95th percentile
- **Concurrency:** Support 1000+ concurrent users
- **Database Queries:** Optimize N+1 prevention
- **Caching Strategy:** Redis for frequently accessed data
- **Connection Pooling:** HikariCP with 10-20 connections

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (p95) | <200ms | Load testing |
| Database Query Time (avg) | <50ms | Database monitoring |
| Authentication Latency | <100ms | API benchmarking |
| Concurrent Users | 1000+ | Load testing |
| Throughput | 100+ requests/sec | Load testing |
| Cache Hit Rate | >80% | Cache monitoring |

## Database Optimization

### Query Optimization

#### Index Usage
```sql
-- Ensure indexes exist for common queries
CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_courses_department ON courses(department_id);
CREATE INDEX idx_users_email ON users(email);
```

#### Query Examples
```java
// BAD: Multiple queries in loop (N+1)
List<Student> students = studentRepository.findAll();
for (Student student : students) {
    student.getCourses(); // Triggers separate query for each student
}

// GOOD: Eager fetching
List<Student> students = studentRepository.findAllWithCourses();
// or
List<Student> students = studentRepository.findAll();
students.forEach(s -> s.setCourses(courseRepository.findByStudentId(s.getId())));

// GOOD: Projection queries
List<StudentSummary> summaries = studentRepository.findSummaryByDepartmentId(departmentId);
```

#### Pagination
```java
// Use pagination for large result sets
PageRequest pageRequest = PageRequest.of(page, size, Sort.by("lastName"));
Page<Student> page = studentRepository.findByDepartmentId(departmentId, pageRequest);

// Use scroll API for very large datasets
ScrollableResults scroll = entityManager.unwrap(Session.class)
    .createSQLQuery("SELECT * FROM students WHERE department_id = :deptId")
    .setParameter("deptId", departmentId)
    .scroll(ScrollMode.FORWARD_ONLY);
```

### Connection Pooling

#### HikariCP Configuration
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
      max-lifetime: 1800000  # 30 minutes
      idle-timeout: 600000  # 10 minutes
      connection-timeout: 30000  # 30 seconds
      validation-timeout: 5000  # 5 seconds
      leak-detection-threshold: 60000  # 60 seconds
      initialization-fail-timeout: -1
      pool-name: CampusFlowHikariPool
```

## Caching Strategy

### Cache Configuration

```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(15))
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new GenericJackson2JsonRedisSerializer()))
            .disableCachingNullValues();
        
        return RedisCacheManager.builder(redisConnectionFactory)
            .cacheDefaults(config)
            .build();
    }
    
    @Bean
    public CacheManager localCacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        cacheManager.setCaches(Collections.singleton(
            new ConcurrentMapCache("default", false)
        ));
        return cacheManager;
    }
}
```

### Cache Usage

```java
@Service
public class ReportService {
    
    @Cacheable(value = "statistics", key = "'all'", unless = "#result == null")
    public StatisticsResponse getStatistics() {
        // Expensive query operation
        StatisticsResponse stats = new StatisticsResponse();
        stats.setTotalStudents(studentRepository.count());
        stats.setTotalCourses(courseRepository.count());
        stats.setTotalEnrollments(enrollmentRepository.count());
        return stats;
    }
    
    @CacheEvict(value = "statistics", allEntries = true)
    public void updateStudent(Long studentId, StudentUpdateRequest request) {
        // This will clear the statistics cache
    }
    
    @Cacheable(value = "students", key = "#studentId")
    public StudentResponse getStudent(Long studentId) {
        return studentRepository.findById(studentId)
            .map(StudentMapper::toResponse)
            .orElseThrow(() -> new NotFoundException("Student not found"));
    }
    
    @CacheEvict(value = "students", key = "#studentId")
    public void updateStudent(Long studentId, StudentUpdateRequest request) {
        // Cache will be evicted
    }
}
```

### Cache Regions

| Cache Name | TTL | Purpose |
|------------|-----|---------|
| statistics | 15 min | System-wide statistics |
| students | 10 min | Student details |
| courses | 10 min | Course details |
| departments | 1 hour | Department information |
| reports | 5 min | Temporary report data |

### Cache Patterns

```java
// Cache-aside pattern
public StudentResponse getStudent(Long id) {
    StudentResponse cached = cacheManager.getCache("students")
        .get(id, StudentResponse.class);
    
    if (cached != null) {
        return cached;
    }
    
    Student student = studentRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("Student not found"));
    
    StudentResponse response = StudentMapper.toResponse(student);
    cacheManager.getCache("students").put(id, response);
    
    return response;
}

// Cache stampede protection
private final ConcurrentHashMap<String, CompletableFuture<StudentResponse>> 
    pendingCaches = new ConcurrentHashMap<>();

public StudentResponse getStudentWithProtection(Long id) {
    return pendingCaches.computeIfAbsent("student:" + id, 
        key -> CompletableFuture.supplyAsync(() -> {
            try {
                return getStudent(id);
            } finally {
                pendingCaches.remove(key);
            }
        })).join();
}
```

## API Optimization

### Response Optimization

```java
// Use projections for specific fields
public interface StudentSummary {
    Long getId();
    String getStudentNumber();
    String getFullName();
    String getDepartmentName();
}

// Use @JsonView for different response levels
@JsonView(View.Public.class)
public class StudentResponse {
    @JsonView(View.Public.class)
    private Long id;
    
    @JsonView(View.Public.class)
    private String studentNumber;
    
    @JsonView(View.Internal.class)
    private String email;
    
    @JsonView(View.Internal.class)
    private String phoneNumber;
}

// Use streaming for large datasets
@GetMapping("/students/export")
public void exportStudents(HttpServletResponse response) throws IOException {
    response.setContentType("text/csv");
    response.setHeader("Content-Disposition", "attachment; filename=students.csv");
    
    try (CSVWriter writer = new CSVWriter(response.getWriter())) {
        studentRepository.findAll().forEach(student -> {
            String[] line = {student.getStudentNumber(), student.getFullName()};
            writer.writeNext(line);
        });
    }
}
```

### Request Optimization

```java
// Use @RequestBodyAdvice for validation
@RestControllerAdvice
public class ValidationAdvice implements RequestBodyAdvice {
    
    @Override
    public boolean supports(MethodParameter methodParameter, 
                           Type targetType, 
                           Class<? extends HttpMessageConverter<?>> converterType) {
        return methodParameter.hasAnnotation(Valid.class);
    }
    
    @Override
    public Object afterBodyRead(Object body, ... ) {
        // Custom validation logic
        return body;
    }
}

// Use request-scoped beans for request context
@Service
@RequestScope
public class RequestContext {
    private Long currentUserId;
    private String currentRole;
    
    public void setCurrentUser(User user) {
        this.currentUserId = user.getId();
        this.currentRole = user.getRole().name();
    }
}
```

### Batch Processing

```java
@Service
public class BatchEnrollmentService {
    
    @Transactional
    public void enrollStudentsInBatch(List<EnrollmentRequest> requests) {
        int batchSize = 50;
        for (int i = 0; i < requests.size(); i++) {
            EnrollmentRequest request = requests.get(i);
            enrollmentService.enrollStudent(request.getStudentId(), 
                request.getCourseId());
            
            if ((i + 1) % batchSize == 0) {
                entityManager.flush();
                entityManager.clear();
            }
        }
    }
}
```

## Monitoring and Observability

### Metrics

```java
@Component
public class PerformanceMetrics {
    
    private final Counter successCounter;
    private final Counter errorCounter;
    private final Timer responseTimer;
    
    public PerformanceMetrics(MeterRegistry registry) {
        this.successCounter = registry.counter("api.requests.success");
        this.errorCounter = registry.counter("api.requests.error");
        this.responseTimer = registry.timer("api.response.time");
    }
    
    public void recordSuccess() {
        successCounter.increment();
    }
    
    public void recordError() {
        errorCounter.increment();
    }
    
    public <T> T measure(String description, Supplier<T> supplier) {
        return responseTimer.record(() -> {
            try {
                T result = supplier.get();
                recordSuccess();
                return result;
            } catch (Exception e) {
                recordError();
                throw e;
            }
        });
    }
}
```

### Logging

```java
@Service
public class PerformanceLoggingService {
    
    private static final Logger logger = LoggerFactory.getLogger(
        PerformanceLoggingService.class);
    
    @Around("execution(* com.campusflow.service.*.*(..))")
    public Object logPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;
            
            if (duration > 1000) {  // Log slow queries
                logger.warn("Slow method: {} took {}ms", 
                    joinPoint.getSignature(), duration);
            }
            
            return result;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            logger.error("Failed method: {} in {}ms", 
                joinPoint.getSignature(), duration, e);
            throw e;
        }
    }
}
```

## Load Testing

### JMeter Test Plan
```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="CampusFlow Load Test">
      <stringProp name="TestPlan.comments"></stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
    </TestPlan>
    
    <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Student API Test">
      <stringProp name="ThreadGroup.num_threads">100</stringProp>
      <stringProp name="ThreadGroup.ramp_time">30</stringProp>
      <longProp name="ThreadGroup.duration">300</longProp>
      <elementProp name="ThreadGroup.main_controller" elementType="LoopController">
        <boolProp name="LoopController.continue_forever">false</boolProp>
        <stringProp name="LoopController.loops">1</stringProp>
      </elementProp>
    </ThreadGroup>
  </hashTree>
</jmeterTestPlan>
```

### Performance Test Scenarios

| Scenario | Users | Duration | Target |
|----------|-------|----------|--------|
| Authentication | 100 | 5 min | <100ms response |
| Student List | 200 | 10 min | <200ms response |
| Course Search | 150 | 5 min | <150ms response |
| Enrollment | 100 | 10 min | <300ms response |
| Report Generation | 50 | 5 min | <2s response |

## Optimization Checklist

### Database
- [ ] All foreign keys have indexes
- [ ] frequently queried columns are indexed
- [ ] Queries use indexes (EXPLAIN ANALYZE)
- [ ] Pagination used for large result sets
- [ ] N+1 queries prevented with JOIN FETCH
- [ ] Connection pool size optimized
- [ ] Slow query logging enabled

### Application
- [ ] Caching implemented for expensive operations
- [ ] Response size optimized with projections
- [ ] Batch processing for bulk operations
- [ ] Lazy loading used appropriately
- [ ] Async processing for long-running tasks
- [ ] Request timeout configured

### API
- [ ] Response headers set (ETag, Cache-Control)
- [ ] Compression enabled (gzip)
- [ ] Rate limiting configured
- [ ] Circuit breaker configured
- [ ] Circuit breaker configured

### Monitoring
- [ ] Performance metrics collected
- [ ] Slow query logging enabled
- [ ] Application monitoring configured
- [ ] Alerting configured
- [ ] Dashboard created

## Related Specs

- Architecture: `campusflow-architecture.md`
- Testing: `testing-strategy.md`
- API: `api-specification.yaml`
