package com.campusflow.web.api;

import com.campusflow.dto.request.EnrollmentCreateRequest;
import com.campusflow.dto.request.GradeUpdateRequest;
import com.campusflow.dto.response.EnrollmentResponse;
import com.campusflow.dto.response.PagedResponse;
import com.campusflow.service.EnrollmentService;
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
 * REST Controller for Enrollment management.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
@Tag(name = "Enrollments", description = "Enrollment management endpoints for course enrollment operations")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List enrollments", description = "Retrieve paginated list of enrollments")
    public ResponseEntity<PagedResponse<EnrollmentResponse>> listEnrollments(
        @Parameter(description = "Page number") @RequestParam(defaultValue = "0") Integer page,
        @Parameter(description = "Page size") @RequestParam(defaultValue = "20") Integer size,
        @Parameter(description = "Student ID filter") @RequestParam(required = false) Long studentId,
        @Parameter(description = "Course ID filter") @RequestParam(required = false) Long courseId,
        @Parameter(description = "Enrollment status filter") @RequestParam(required = false) String status
    ) {
        PagedResponse<EnrollmentResponse> response =
            enrollmentService.listEnrollments(page, size, studentId, courseId, status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get enrollment by ID", description = "Retrieve detailed information about an enrollment")
    public ResponseEntity<EnrollmentResponse> getEnrollment(
        @Parameter(description = "Enrollment ID") @PathVariable Long id
    ) {
        EnrollmentResponse response = enrollmentService.getEnrollment(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Enroll student", description = "Enroll a student in a course")
    public ResponseEntity<EnrollmentResponse> enrollStudent(
        @Valid @RequestBody EnrollmentCreateRequest request
    ) {
        EnrollmentResponse response = enrollmentService.enrollStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/grade")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Update grade", description = "Set or change enrollment grade")
    public ResponseEntity<EnrollmentResponse> updateGrade(
        @Parameter(description = "Enrollment ID") @PathVariable Long id,
        @Valid @RequestBody GradeUpdateRequest request
    ) {
        return ResponseEntity.ok(enrollmentService.updateGrade(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Drop course", description = "Drop a course for a student")
    public ResponseEntity<Void> dropCourse(
        @Parameter(description = "Enrollment ID") @PathVariable Long id
    ) {
        enrollmentService.dropCourse(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get student enrollments", description = "Retrieve enrollments for a student")
    public ResponseEntity<PagedResponse<EnrollmentResponse>> getStudentEnrollments(
        @Parameter(description = "Student ID") @PathVariable Long studentId
    ) {
        PagedResponse<EnrollmentResponse> response = enrollmentService.listStudentEnrollments(studentId, 0, 20, null, null);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get course enrollments", description = "Retrieve enrollments for a course")
    public ResponseEntity<PagedResponse<EnrollmentResponse>> getCourseEnrollments(
        @Parameter(description = "Course ID") @PathVariable Long courseId
    ) {
        PagedResponse<EnrollmentResponse> response = enrollmentService.listCourseEnrollments(courseId, 0, 20, null);
        return ResponseEntity.ok(response);
    }
}
