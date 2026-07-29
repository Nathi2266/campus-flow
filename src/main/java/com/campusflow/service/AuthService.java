package com.campusflow.service;

import com.campusflow.domain.AuditLog;
import com.campusflow.domain.Student;
import com.campusflow.domain.Token;
import com.campusflow.domain.User;
import com.campusflow.domain.enums.AcademicStatus;
import com.campusflow.domain.enums.UserRole;
import com.campusflow.dto.mapper.UserMapper;
import com.campusflow.dto.request.LoginRequest;
import com.campusflow.dto.request.ProfileUpdateRequest;
import com.campusflow.dto.request.RefreshRequest;
import com.campusflow.dto.request.UserRegistrationRequest;
import com.campusflow.dto.response.AuthResponse;
import com.campusflow.dto.response.UserResponse;
import com.campusflow.exception.NotFoundException;
import com.campusflow.exception.ValidationException;
import com.campusflow.repository.AuditLogRepository;
import com.campusflow.repository.StudentRepository;
import com.campusflow.repository.TokenRepository;
import com.campusflow.repository.UserRepository;
import com.campusflow.security.JwtTokenProvider;
import com.campusflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Map;

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
    private final StudentRepository studentRepository;
    private final TokenRepository tokenRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final SecurityUtils securityUtils;
    private final UserMapper userMapper;

    public AuthResponse register(UserRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already exists", "email", "EMAIL_EXISTS");
        }

        // Public registration creates STUDENT only
        if (request.getRole() != null && !request.getRole().isBlank()
            && !"STUDENT".equalsIgnoreCase(request.getRole().trim())) {
            throw new ValidationException(
                "Public registration allows STUDENT role only",
                "role",
                "INVALID_ROLE"
            );
        }

        User user = User.builder()
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .role(UserRole.STUDENT)
            .build();

        user = userRepository.save(user);

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

        return issueTokens(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ValidationException("Invalid credentials", "credentials", "INVALID_CREDENTIALS"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ValidationException("Invalid credentials", "credentials", "INVALID_CREDENTIALS");
        }

        log.info("User logged in: {}", user.getEmail());
        auditLogRepository.save(AuditLog.builder()
            .user(user)
            .action("LOGIN")
            .entityType("USER")
            .entityId(user.getId())
            .details(Map.of("email", user.getEmail()))
            .build());

        return issueTokens(user);
    }

    public AuthResponse refresh(RefreshRequest request) {
        String refreshTokenValue = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(refreshTokenValue)
            || !jwtTokenProvider.isRefreshToken(refreshTokenValue)) {
            throw new ValidationException("Invalid refresh token", "refreshToken", "INVALID_TOKEN");
        }

        Token storedToken = tokenRepository.findByTokenAndRevokedFalseAndExpiredFalse(refreshTokenValue)
            .orElseThrow(() -> new ValidationException("Refresh token revoked or unknown", "refreshToken", "INVALID_TOKEN"));

        if (storedToken.getExpiresAt().isBefore(OffsetDateTime.now())) {
            storedToken.setExpired(true);
            storedToken.setRevoked(true);
            tokenRepository.save(storedToken);
            throw new ValidationException("Refresh token expired", "refreshToken", "TOKEN_EXPIRED");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(refreshTokenValue);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found", "userId"));

        // Rotate: revoke old refresh token
        storedToken.setRevoked(true);
        storedToken.setExpired(true);
        tokenRepository.save(storedToken);

        return issueTokens(user);
    }

    public void logout(RefreshRequest request) {
        String refreshTokenValue = request.getRefreshToken();
        tokenRepository.findByToken(refreshTokenValue).ifPresent(token -> {
            token.setRevoked(true);
            token.setExpired(true);
            tokenRepository.save(token);
        });
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        return userMapper.toResponse(securityUtils.getCurrentUser());
    }

    public UserResponse updateProfile(ProfileUpdateRequest request) {
        User user = securityUtils.getCurrentUser();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());

        if (user.getStudent() != null) {
            user.getStudent().setFirstName(request.getFirstName());
            user.getStudent().setLastName(request.getLastName());
        }

        return userMapper.toResponse(userRepository.save(user));
    }

    private AuthResponse issueTokens(User user) {
        Long departmentId = user.getDepartment() != null ? user.getDepartment().getId() : null;
        String accessToken = jwtTokenProvider.generateAccessToken(
            user.getId(), user.getEmail(), user.getRole().name(), departmentId
        );
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        OffsetDateTime expiresAt = OffsetDateTime.ofInstant(
            jwtTokenProvider.getExpirationFromToken(refreshToken),
            ZoneOffset.UTC
        );

        tokenRepository.save(Token.builder()
            .user(user)
            .token(refreshToken)
            .tokenType("REFRESH")
            .revoked(false)
            .expired(false)
            .expiresAt(expiresAt)
            .createdBy(user.getId())
            .build());

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .expiresAt(LocalDateTime.now().plusMinutes(15))
            .user(userMapper.toResponse(user))
            .build();
    }

    private String generateUniqueStudentNumber() {
        String number;
        do {
            number = "STU" + System.currentTimeMillis() % 100000000L + (int) (Math.random() * 1000);
        } while (studentRepository.existsByStudentNumber(number));
        return number;
    }
}
