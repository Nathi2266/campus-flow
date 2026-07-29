# CampusFlow Security Implementation

## Overview

- **Authentication:** JWT (JSON Web Tokens) with access and refresh tokens
- **Authorization:** Role-Based Access Control (RBAC) with method-level security
- **Password Hashing:** BCrypt with 12 rounds
- **Session Management:** Refresh token rotation and revocation

## Authentication Flow

### User Registration
```
1. User submits registration form (email, password, firstName, lastName, role)
2. Backend validates input
3. Password is hashed using BCrypt
4. User record created with role
5. JWT access token generated (expires in 15 minutes)
6. Refresh token generated (expires in 7 days)
7. Response returns access token, refresh token, and user details
```

### User Login
```
1. User submits credentials (email, password)
2. Backend validates credentials against database
3. Password hash compared with stored hash
4. JWT access token generated (expires in 15 minutes)
5. Refresh token generated and stored in database (expires in 7 days)
6. Response returns access token, refresh token, and user details
```

### Token Refresh
```
1. Access token has expired
2. Client sends refresh token to /auth/refresh endpoint
3. Backend validates refresh token from database
4. New access token generated
5. Old refresh token revoked (rotation)
6. New refresh token generated
7. Response returns new tokens
```

### Logout
```
1. Client calls /auth/logout endpoint with current refresh token
2. Backend revokes the refresh token in database
3. Token marked as revoked and expired
4. Response returns 204 No Content
```

## JWT Token Structure

### Access Token
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "STUDENT|LECTURER|ADMIN",
  "departmentId": 1,
  "iat": 1234567890,
  "exp": 1234567905  // 15 minutes
}
```

### Refresh Token
```json
{
  "sub": "user_id",
  "token_type": "refresh",
  "jti": "unique_token_id",
  "iat": 1234567890,
  "exp": 1234567905  // 7 days
}
```

## Role-Based Access Control

### Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| ADMIN | System administrator | Full access to all endpoints |
| LECTURER | Course instructor | Manage courses, view students, view reports |
| STUDENT | Student user | View own profile, enroll in courses, view courses |

### Permission Matrix

| Endpoint | ADMIN | LECTURER | STUDENT |
|----------|-------|----------|---------|
| POST /auth/register (STUDENT only) | ✗ | ✗ | ✓ |
| POST /auth/login | ✓ | ✓ | ✓ |
| POST /auth/refresh | ✓ | ✓ | ✓ |
| POST /auth/logout | ✓ | ✓ | ✓ |
| GET/PATCH /auth/me | ✓ | ✓ | ✓ |
| GET /students | ✓ | ✓ | ✓ |
| POST /students | ✓ | ✗ | ✗ |
| PUT /students/{id} | ✓ | ✗ | ✗ |
| DELETE /students/{id} | ✓ | ✗ | ✗ |
| GET /courses | ✓ | ✓ | ✓ |
| POST /courses | ✓ | ✗ | ✗ |
| PUT /courses/{id} | ✓ | Own only | ✗ |
| DELETE /courses/{id} | ✓ | ✗ | ✗ |
| POST /courses/{id}/activate | ✓ | ✗ | ✗ |
| POST /courses/{id}/deactivate | ✓ | ✗ | ✗ |
| GET /enrollments | ✓ | Own courses | Own only |
| POST /enrollments | ✓ | ✓ | Own only |
| PATCH /enrollments/{id}/grade | ✓ | Own courses | ✗ |
| DELETE /enrollments/{id} | ✓ | ✓ | Own only |
| GET /reports/* | ✓ | ✓ | ✗ |
| /departments, /users, /audit-logs | ✓ | ✗ | ✗ |

Canonical role rules: `campusflow-roles.md`. Grade rules: `campusflow-grades.md`.

## Security Configuration

### Spring Security Configuration

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/v1/api-docs/**").permitAll()
                .requestMatchers("/api/v1/swagger-ui/**").permitAll()
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .decoder(jwtDecoder())
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())))
            .addFilterBefore(jwtAuthenticationFilter(), 
                UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### Method-Level Security

```java
@Service
@PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
public class CourseService {
    
    @PreAuthorize("hasRole('ADMIN')")
    public Course createCourse(CourseCreateRequest request) {
        // Implementation
    }
    
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public Course updateCourse(Long courseId, CourseUpdateRequest request) {
        // Implementation
    }
}
```

### Permission Expressions

```java
@PreAuthorize("hasRole('ADMIN')")
@PreAuthorize("hasRole('LECTURER')")
@PreAuthorize("hasRole('STUDENT')")
@PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
@PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'STUDENT')")

// Department-based authorization
@PreAuthorize("@securityService.hasDepartmentAccess(#departmentId)")

// User-based authorization
@PreAuthorize("@securityService.isOwner(#userId, authentication)")
```

## Password Security

### Password Requirements
- Minimum length: 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one numeric character
- At least one special character

### Password Hashing
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
}
```

### Password Validation
```java
@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")
private String password;
```

## Refresh Token Management

### Database Schema
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
```

### Token Rotation
1. When access token expires, client sends refresh token
2. Backend validates refresh token from database
3. Old refresh token is revoked (expired = true)
4. New refresh token is generated and stored
5. New access token is generated and returned

### Token Revocation
```java
public void revokeToken(String token) {
    Token storedToken = tokenRepository.findByToken(token)
        .orElseThrow(() -> new TokenNotFoundException("Token not found"));
    
    storedToken.setRevoked(true);
    storedToken.setExpired(true);
    tokenRepository.save(storedToken);
}
```

## Security Headers

### Response Headers
```java
@Bean
public FilterRegistrationBean<CorsFilter> corsFilter() {
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowCredentials(true);
    config.addAllowedOriginPattern("*");
    config.addAllowedHeader("*");
    config.addAllowedMethod("*");
    source.registerCorsConfiguration("/**", config);
    
    FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
    bean.setOrder(0);
    return bean;
}
```

## Audit Logging

### Security Audit Events
```java
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(nullable = false)
    private String action;
    
    @Column(nullable = false)
    private String entityType;
    
    @Column(nullable = false)
    private Long entityId;
    
    @Column(columnDefinition = "JSONB")
    private Map<String, Object> details;
    
    private String ipAddress;
    
    private String userAgent;
    
    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}
```

## Input Validation

### Request Validation
```java
@Data
@Builder
public class LoginRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}
```

### Custom Validators
```java
@Component
@Constraint(validatedBy = {})
public @interface StrongPassword {
    String message() default "Password must contain uppercase, lowercase, number, and special character";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

## Error Responses

### Security Errors
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid credentials",
  "path": "/api/auth/login",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Access Denied
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "You do not have permission to access this resource",
  "path": "/api/students",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## JWT Filter Implementation

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Autowired
    private CustomUserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain chain) throws ServletException, IOException {
        
        String jwt = getJwtFromRequest(request);
        
        if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
            Long userId = tokenProvider.getUserIdFromToken(jwt);
            UserDetails userDetails = userDetailsService.loadUserById(userId);
            
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
                );
            
            authentication.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request)
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        
        chain.doFilter(request, response);
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

## Related Specs

- Architecture: `campusflow-architecture.md`
- Database: `database-schema.md`
- API: `api-specification.yaml`
