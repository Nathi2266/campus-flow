package com.campusflow.web.api;

import com.campusflow.dto.request.LoginRequest;
import com.campusflow.dto.request.NotifyPreferenceRequest;
import com.campusflow.dto.request.ProfileUpdateRequest;
import com.campusflow.dto.request.RefreshRequest;
import com.campusflow.dto.request.ThemePreferenceRequest;
import com.campusflow.dto.request.UserRegistrationRequest;
import com.campusflow.dto.response.AuthResponse;
import com.campusflow.dto.response.UserResponse;
import com.campusflow.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Authentication.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication endpoints for login, registration, and token management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Create a new STUDENT account")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody UserRegistrationRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticate user and return JWT tokens")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Refresh expired access token using refresh token")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        AuthResponse response = authService.refresh(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Revoke current refresh token (no access token required)")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user", description = "Get details of the currently authenticated user")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    @PatchMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update profile", description = "Update first name, last name, and phone number")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(authService.updateProfile(request));
    }

    @PatchMapping("/me/theme")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update theme preference", description = "Persist light or dark UI theme for the current user")
    public ResponseEntity<UserResponse> updateTheme(@Valid @RequestBody ThemePreferenceRequest request) {
        return ResponseEntity.ok(authService.updateThemePreference(request));
    }

    @PatchMapping("/me/notifications")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update notification preference", description = "Toggle in-app notification delivery")
    public ResponseEntity<UserResponse> updateNotifyPreference(@Valid @RequestBody NotifyPreferenceRequest request) {
        return ResponseEntity.ok(authService.updateNotifyPreference(request));
    }
}
