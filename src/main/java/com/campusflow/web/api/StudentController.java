package com.campusflow.web.api;

import com.campusflow.domain.enums.AcademicStatus;
import com.campusflow.dto.request.PaginationRequest;
import com.campusflow.dto.request.StudentCreateRequest;
import com.campusflow.dto.request.StudentUpdateRequest;
import com.campusflow.dto.response.StudentResponse;
import com.campusflow.dto.response.PagedResponse;
import com.campusflow.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Student management.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
@Tag(name = "Students", description = "Student management endpoints for CRUD operations")
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    @Operation(summary = "List students", description = "Retrieve paginated list of students")
    public ResponseEntity<PagedResponse<StudentResponse>> listStudents(
        @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") Integer page,
        @Parameter(description = "Page size") @RequestParam(defaultValue = "20") Integer size,
        @Parameter(description = "Sort criteria (field,direction)") @RequestParam(required = false) String sort,
        @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId,
        @Parameter(description = "Academic status filter") @RequestParam(required = false) AcademicStatus status
    ) {
        PagedResponse<StudentResponse> response = studentService.listStudents(page, size, sort, departmentId, status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get student by ID", description = "Retrieve detailed information about a student")
    public ResponseEntity<StudentResponse> getStudent(
        @Parameter(description = "Student ID") @PathVariable Long id
    ) {
        StudentResponse response = studentService.getStudent(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Create student", description = "Create a new student record")
    public ResponseEntity<StudentResponse> createStudent(
        @Valid @RequestBody StudentCreateRequest request
    ) {
        StudentResponse response = studentService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update student", description = "Update student information")
    public ResponseEntity<StudentResponse> updateStudent(
        @Parameter(description = "Student ID") @PathVariable Long id,
        @Valid @RequestBody StudentUpdateRequest request
    ) {
        StudentResponse response = studentService.updateStudent(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete student", description = "Soft delete a student record")
    public ResponseEntity<Void> deleteStudent(
        @Parameter(description = "Student ID") @PathVariable Long id
    ) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/courses")
    @Operation(summary = "Get student courses", description = "Retrieve courses enrolled by a student")
    public ResponseEntity<PagedResponse<StudentResponse>> getStudentCourses(
        @Parameter(description = "Student ID") @PathVariable Long id,
        @Parameter(description = "Only active courses") @RequestParam(defaultValue = "true") Boolean activeOnly
    ) {
        // This would return the student's enrollments
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search students", description = "Search students by name or student number")
    public ResponseEntity<PagedResponse<StudentResponse>> searchStudents(
        @Parameter(description = "Search query") @RequestParam String search,
        @Parameter(description = "Page number") @RequestParam(defaultValue = "0") Integer page,
        @Parameter(description = "Page size") @RequestParam(defaultValue = "20") Integer size,
        @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId
    ) {
        PagedResponse<StudentResponse> response = studentService.searchStudents(search, page, size, departmentId);
        return ResponseEntity.ok(response);
    }
}
