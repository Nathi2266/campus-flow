package com.campusflow.web.api;

import com.campusflow.dto.request.CourseCreateRequest;
import com.campusflow.dto.request.CourseUpdateRequest;
import com.campusflow.dto.response.CourseResponse;
import com.campusflow.dto.response.PagedResponse;
import com.campusflow.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Course management.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Course management endpoints for CRUD operations")
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    @Operation(summary = "List courses", description = "Retrieve paginated list of courses")
    public ResponseEntity<PagedResponse<CourseResponse>> listCourses(
        @Parameter(description = "Page number") @RequestParam(defaultValue = "0") Integer page,
        @Parameter(description = "Page size") @RequestParam(defaultValue = "20") Integer size,
        @Parameter(description = "Sort criteria") @RequestParam(required = false) String sort,
        @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId,
        @Parameter(description = "Lecturer ID filter") @RequestParam(required = false) Long lecturerId,
        @Parameter(description = "Active status filter") @RequestParam(required = false) Boolean active
    ) {
        PagedResponse<CourseResponse> response = courseService.listCourses(page, size, sort, departmentId, lecturerId, active);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course by ID", description = "Retrieve detailed information about a course")
    public ResponseEntity<CourseResponse> getCourse(
        @Parameter(description = "Course ID") @PathVariable Long id
    ) {
        CourseResponse response = courseService.getCourse(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Create course", description = "Create a new course")
    public ResponseEntity<CourseResponse> createCourse(
        @Valid @RequestBody CourseCreateRequest request
    ) {
        CourseResponse response = courseService.createCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update course", description = "Update course information")
    public ResponseEntity<CourseResponse> updateCourse(
        @Parameter(description = "Course ID") @PathVariable Long id,
        @Valid @RequestBody CourseUpdateRequest request
    ) {
        CourseResponse response = courseService.updateCourse(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete course", description = "Soft delete a course")
    public ResponseEntity<Void> deleteCourse(
        @Parameter(description = "Course ID") @PathVariable Long id
    ) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/activate")
    @Operation(summary = "Activate course", description = "Activate a course for enrollment")
    public ResponseEntity<CourseResponse> activateCourse(
        @Parameter(description = "Course ID") @PathVariable Long id
    ) {
        CourseResponse response = courseService.activateCourse(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate course", description = "Deactivate a course to prevent new enrollments")
    public ResponseEntity<CourseResponse> deactivateCourse(
        @Parameter(description = "Course ID") @PathVariable Long id
    ) {
        CourseResponse response = courseService.deactivateCourse(id);
        return ResponseEntity.ok(response);
    }
}
