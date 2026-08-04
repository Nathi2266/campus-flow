package com.campusflow.service;

import com.campusflow.domain.AuditLog;
import com.campusflow.domain.Student;
import com.campusflow.domain.User;
import com.campusflow.domain.enums.AcademicStatus;
import com.campusflow.domain.enums.UserRole;
import com.campusflow.dto.mapper.UserMapper;
import com.campusflow.dto.request.UserAdminCreateRequest;
import com.campusflow.dto.request.UserAdminUpdateRequest;
import com.campusflow.dto.response.PagedResponse;
import com.campusflow.dto.response.UserResponse;
import com.campusflow.exception.NotFoundException;
import com.campusflow.exception.ValidationException;
import com.campusflow.repository.AuditLogRepository;
import com.campusflow.repository.DepartmentRepository;
import com.campusflow.repository.StudentRepository;
import com.campusflow.repository.UserRepository;
import com.campusflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Map;

/**
 * ADMIN user administration service.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserAdminService {

    private static final String TEMP_PASSWORD_CHARS =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AuditLogRepository auditLogRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> listUsers(Integer page, Integer size, String role) {
        Pageable pageable = pageable(page, size);
        Page<User> userPage;
        if (role != null && !role.isBlank()) {
            userPage = userRepository.findByRole(parseRole(role), pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }
        return toPaged(userPage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> searchUsers(String search, Integer page, Integer size, String role) {
        if (search == null || search.isBlank()) {
            return listUsers(page, size, role);
        }
        Pageable pageable = pageable(page, size);
        String query = search.trim();
        Page<User> userPage;
        if (role != null && !role.isBlank()) {
            userPage = userRepository.searchByRole(query, parseRole(role), pageable);
        } else {
            userPage = userRepository.searchAll(query, pageable);
        }
        return toPaged(userPage);
    }

    public UserResponse createUser(UserAdminCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already exists", "email", "EMAIL_EXISTS");
        }

        UserRole role = parseRole(request.getRole());
        boolean generated = request.getPassword() == null || request.getPassword().isBlank();
        if (!generated && request.getPassword().trim().length() < 8) {
            throw new ValidationException("Password must be at least 8 characters", "password", "WEAK_PASSWORD");
        }
        String plainPassword = generated ? generateTemporaryPassword() : request.getPassword().trim();

        User user = User.builder()
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(plainPassword))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .role(role)
            .phoneNumber(request.getPhoneNumber())
            .active(true)
            .build();

        if (request.getDepartmentId() != null) {
            user.setDepartment(departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new NotFoundException("Department not found", "departmentId")));
        }

        user = userRepository.save(user);

        if (role == UserRole.STUDENT && !studentRepository.existsByUserId(user.getId())) {
            Student student = Student.builder()
                .user(user)
                .studentNumber(generateUniqueStudentNumber())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .enrollmentDate(java.time.LocalDate.now())
                .academicStatus(AcademicStatus.ACTIVE)
                .build();
            studentRepository.save(student);
            user.setStudent(student);
        }

        UserResponse response = userMapper.toResponse(user);
        if (generated) {
            response.setTemporaryPassword(plainPassword);
        }
        auditLogRepository.save(AuditLog.builder()
            .user(securityUtils.getCurrentUser())
            .action("USER_CREATE")
            .entityType("USER")
            .entityId(user.getId())
            .details(Map.of(
                "email", user.getEmail(),
                "role", role.name(),
                "temporaryPassword", generated
            ))
            .build());
        return response;
    }

    public UserResponse updateUser(Long id, UserAdminUpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("User not found", "id"));

        if (request.getRole() != null && !request.getRole().isBlank()) {
            user.setRole(parseRole(request.getRole()));
        }

        if (request.getDepartmentId() != null) {
            user.setDepartment(departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new NotFoundException("Department not found", "departmentId")));
        }

        User saved = userRepository.save(user);
        auditLogRepository.save(AuditLog.builder()
            .user(securityUtils.getCurrentUser())
            .action("USER_UPDATE")
            .entityType("USER")
            .entityId(saved.getId())
            .details(Map.of("role", saved.getRole().name()))
            .build());
        return userMapper.toResponse(saved);
    }

    public UserResponse deactivateUser(Long id) {
        User current = securityUtils.getCurrentUser();
        if (current.getId().equals(id)) {
            throw new ValidationException("You cannot deactivate your own account", "id", "SELF_DEACTIVATE");
        }
        User user = userRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("User not found", "id"));
        user.setActive(false);
        User saved = userRepository.save(user);
        auditLogRepository.save(AuditLog.builder()
            .user(current)
            .action("USER_DEACTIVATE")
            .entityType("USER")
            .entityId(saved.getId())
            .details(Map.of("email", saved.getEmail()))
            .build());
        return userMapper.toResponse(saved);
    }

    public UserResponse activateUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("User not found", "id"));
        user.setActive(true);
        User saved = userRepository.save(user);
        auditLogRepository.save(AuditLog.builder()
            .user(securityUtils.getCurrentUser())
            .action("USER_ACTIVATE")
            .entityType("USER")
            .entityId(saved.getId())
            .details(Map.of("email", saved.getEmail()))
            .build());
        return userMapper.toResponse(saved);
    }

    private Pageable pageable(Integer page, Integer size) {
        return PageRequest.of(
            page != null ? page : 0,
            size != null ? size : 20,
            Sort.by(Sort.Direction.DESC, "id")
        );
    }

    private PagedResponse<UserResponse> toPaged(Page<User> userPage) {
        return PagedResponse.<UserResponse>builder()
            .content(userPage.getContent().stream().map(userMapper::toResponse).toList())
            .page(userPage.getNumber())
            .size(userPage.getSize())
            .totalElements(userPage.getTotalElements())
            .totalPages(userPage.getTotalPages())
            .isFirst(userPage.isFirst())
            .isLast(userPage.isLast())
            .hasContent(userPage.hasContent())
            .build();
    }

    private UserRole parseRole(String role) {
        try {
            return UserRole.valueOf(role.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid role. Must be ADMIN, LECTURER, or STUDENT", "role", "INVALID_ROLE");
        }
    }

    private String generateUniqueStudentNumber() {
        String number;
        do {
            number = "STU" + System.currentTimeMillis() % 100000000L + SECURE_RANDOM.nextInt(1000);
        } while (studentRepository.existsByStudentNumber(number));
        return number;
    }

    private String generateTemporaryPassword() {
        StringBuilder sb = new StringBuilder(14);
        for (int i = 0; i < 14; i++) {
            sb.append(TEMP_PASSWORD_CHARS.charAt(SECURE_RANDOM.nextInt(TEMP_PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }
}
