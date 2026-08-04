package com.campusflow.web.api;

import com.campusflow.dto.request.UserAdminCreateRequest;
import com.campusflow.dto.request.UserAdminUpdateRequest;
import com.campusflow.dto.response.PagedResponse;
import com.campusflow.dto.response.UserResponse;
import com.campusflow.service.UserAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for ADMIN user administration.
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Users", description = "User administration endpoints")
public class UserController {

    private final UserAdminService userAdminService;

    @GetMapping
    @Operation(summary = "List users")
    public ResponseEntity<PagedResponse<UserResponse>> listUsers(
        @Parameter(description = "Page number") @RequestParam(defaultValue = "0") Integer page,
        @Parameter(description = "Page size") @RequestParam(defaultValue = "20") Integer size,
        @Parameter(description = "Role filter") @RequestParam(required = false) String role
    ) {
        return ResponseEntity.ok(userAdminService.listUsers(page, size, role));
    }

    @GetMapping("/search")
    @Operation(summary = "Search users by name or email")
    public ResponseEntity<PagedResponse<UserResponse>> searchUsers(
        @Parameter(description = "Search query") @RequestParam String search,
        @Parameter(description = "Page number") @RequestParam(defaultValue = "0") Integer page,
        @Parameter(description = "Page size") @RequestParam(defaultValue = "20") Integer size,
        @Parameter(description = "Role filter") @RequestParam(required = false) String role
    ) {
        return ResponseEntity.ok(userAdminService.searchUsers(search, page, size, role));
    }

    @PostMapping
    @Operation(summary = "Create user (optional password — generates temporary password when omitted)")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserAdminCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userAdminService.createUser(request));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update user role/department")
    public ResponseEntity<UserResponse> updateUser(
        @Parameter(description = "User ID") @PathVariable Long id,
        @Valid @RequestBody UserAdminUpdateRequest request
    ) {
        return ResponseEntity.ok(userAdminService.updateUser(id, request));
    }

    @PostMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate user (blocks login)")
    public ResponseEntity<UserResponse> deactivateUser(
        @Parameter(description = "User ID") @PathVariable Long id
    ) {
        return ResponseEntity.ok(userAdminService.deactivateUser(id));
    }

    @PostMapping("/{id}/activate")
    @Operation(summary = "Activate user")
    public ResponseEntity<UserResponse> activateUser(
        @Parameter(description = "User ID") @PathVariable Long id
    ) {
        return ResponseEntity.ok(userAdminService.activateUser(id));
    }
}
