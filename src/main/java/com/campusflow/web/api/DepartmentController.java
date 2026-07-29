package com.campusflow.web.api;

import com.campusflow.dto.request.DepartmentCreateRequest;
import com.campusflow.dto.request.DepartmentUpdateRequest;
import com.campusflow.dto.response.DepartmentResponse;
import com.campusflow.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Department management (ADMIN).
 */
@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
@Tag(name = "Departments", description = "Department management endpoints")
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List departments")
    public ResponseEntity<List<DepartmentResponse>> listDepartments() {
        return ResponseEntity.ok(departmentService.listDepartments());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get department by ID")
    public ResponseEntity<DepartmentResponse> getDepartment(
        @Parameter(description = "Department ID") @PathVariable Long id
    ) {
        return ResponseEntity.ok(departmentService.getDepartment(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create department")
    public ResponseEntity<DepartmentResponse> createDepartment(
        @Valid @RequestBody DepartmentCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(departmentService.createDepartment(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update department")
    public ResponseEntity<DepartmentResponse> updateDepartment(
        @Parameter(description = "Department ID") @PathVariable Long id,
        @Valid @RequestBody DepartmentUpdateRequest request
    ) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete department")
    public ResponseEntity<Void> deleteDepartment(
        @Parameter(description = "Department ID") @PathVariable Long id
    ) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
}
