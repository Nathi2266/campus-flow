package com.campusflow.web.api;

import com.campusflow.dto.response.*;
import com.campusflow.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Reports and Statistics.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
@Tag(name = "Reports", description = "Reporting and analytics endpoints")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/statistics")
    @Operation(summary = "Get system statistics", description = "Retrieve overall system statistics")
    public ResponseEntity<StatisticsResponse> getStatistics() {
        StatisticsResponse response = reportService.getStatistics();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/students-per-course")
    @Operation(summary = "Get students per course", description = "Retrieve count of enrolled students per course")
    public ResponseEntity<List<StudentsPerCourseResponse>> getStudentsPerCourse(
        @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId
    ) {
        return ResponseEntity.ok(reportService.getStudentsPerCourse(departmentId));
    }

    @GetMapping("/graduation-progress")
    @Operation(summary = "Get graduation progress", description = "Retrieve graduation progress report")
    public ResponseEntity<GraduationProgressResponse> getGraduationProgress(
        @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId,
        @Parameter(description = "Year") @RequestParam(required = false) Integer year
    ) {
        GraduationProgressResponse response = reportService.getGraduationProgress(departmentId, year);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active-courses")
    @Operation(summary = "Get active courses", description = "Retrieve list of active courses with enrollment counts")
    public ResponseEntity<List<ActiveCourseResponse>> getActiveCourses(
        @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId
    ) {
        return ResponseEntity.ok(reportService.getActiveCourses(departmentId));
    }

    @GetMapping("/inactive-courses")
    @Operation(summary = "Get inactive courses", description = "Retrieve list of inactive courses")
    public ResponseEntity<List<CourseResponse>> getInactiveCourses(
        @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId
    ) {
        return ResponseEntity.ok(reportService.getInactiveCourses(departmentId));
    }
}
