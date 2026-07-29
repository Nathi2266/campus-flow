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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * ADMIN user administration service.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserAdminService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AuditLogRepository auditLogRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> listUsers(Integer page, Integer size, String role) {
        Pageable pageable = PageRequest.of(page != null ? page : 0, size != null ? size : 20);
        Page<User> userPage;
        if (role != null && !role.isBlank()) {
            userPage = userRepository.findByRole(parseRole(role), pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

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

    public UserResponse createUser(UserAdminCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already exists", "email", "EMAIL_EXISTS");
        }

        UserRole role = parseRole(request.getRole());

        User user = User.builder()
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .role(role)
            .phoneNumber(request.getPhoneNumber())
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
        auditLogRepository.save(AuditLog.builder()
            .user(securityUtils.getCurrentUser())
            .action("USER_CREATE")
            .entityType("USER")
            .entityId(user.getId())
            .details(Map.of("email", user.getEmail(), "role", role.name()))
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
            number = "STU" + System.currentTimeMillis() % 100000000L + (int) (Math.random() * 1000);
        } while (studentRepository.existsByStudentNumber(number));
        return number;
    }
}
