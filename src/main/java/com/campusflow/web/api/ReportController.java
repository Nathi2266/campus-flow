package com.campusflow.web.api;

import com.campusflow.dto.response.*;
import com.campusflow.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Reports and Statistics.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
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
    public ResponseEntity<?> getStudentsPerCourse(
        @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId
    ) {
        // This would return the students per course report
        return ResponseEntity.ok().build();
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
    public ResponseEntity<?> getActiveCourses(
        @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId
    ) {
        // This would return the active courses report
        return ResponseEntity.ok().build();
    }

    @GetMapping("/inactive-courses")
    @Operation(summary = "Get inactive courses", description = "Retrieve list of inactive courses")
    public ResponseEntity<?> getInactiveCourses(
        @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId
    ) {
        // This would return the inactive courses report
        return ResponseEntity.ok().build();
    }
}
