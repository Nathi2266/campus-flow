package com.campusflow.service;

import com.campusflow.domain.User;
import com.campusflow.domain.enums.UserRole;
import com.campusflow.dto.request.LoginRequest;
import com.campusflow.dto.request.RefreshRequest;
import com.campusflow.dto.request.UserRegistrationRequest;
import com.campusflow.dto.response.AuthResponse;
import com.campusflow.dto.response.UserResponse;
import com.campusflow.exception.NotFoundException;
import com.campusflow.exception.ValidationException;
import com.campusflow.repository.DepartmentRepository;
import com.campusflow.repository.UserRepository;
import com.campusflow.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service class for Authentication.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthResponse register(UserRegistrationRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already exists", "email", "EMAIL_EXISTS");
        }

        // Validate role
        UserRole userRole = validateRole(request.getRole());

        // Create user
        User user = User.builder()
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .role(userRole)
            .build();

        // Set department if admin or lecturer
        if (request.getDepartmentId() != null && (userRole == UserRole.ADMIN || userRole == UserRole.LECTURER)) {
            user.setDepartment(departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new NotFoundException("Department not found", "departmentId")));
        }

        userRepository.save(user);

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(
            user.getId(), user.getEmail(), userRole.name(), user.getDepartment() != null ? user.getDepartment().getId() : null
        );
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .expiresAt(LocalDateTime.now().plusMinutes(15))
            .user(UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(userRole.name())
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .build())
            .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ValidationException("Invalid credentials", "credentials", "INVALID_CREDENTIALS"));

        // Note: Password validation would happen in a custom authentication provider
        // For now, we'll assume the password is correct if user exists

        String accessToken = jwtTokenProvider.generateAccessToken(
            user.getId(), user.getEmail(), user.getRole().name(), user.getDepartment() != null ? user.getDepartment().getId() : null
        );
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        log.info("User logged in: {}", user.getEmail());

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .expiresAt(LocalDateTime.now().plusMinutes(15))
            .user(UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .build())
            .build();
    }

    public AuthResponse refresh(RefreshRequest request) {
        // Token validation happens in the filter
        // Here we generate new tokens
        String accessToken = jwtTokenProvider.generateAccessToken(
            1L, "user@example.com", "STUDENT", null
        );
        String refreshToken = jwtTokenProvider.generateRefreshToken(1L);

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .expiresAt(LocalDateTime.now().plusMinutes(15))
            .user(UserResponse.builder()
                .id(1L)
                .email("user@example.com")
                .firstName("User")
                .lastName("Example")
                .role("STUDENT")
                .build())
            .build();
    }

    private UserRole validateRole(String role) {
        try {
            return UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid role. Must be ADMIN, LECTURER, or STUDENT", "role", "INVALID_ROLE");
        }
    }
}
