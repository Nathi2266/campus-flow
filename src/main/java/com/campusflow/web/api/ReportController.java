package com.campusflow.web.api;

import com.campusflow.dto.response.*;
import com.campusflow.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
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
    @Operation(summary = "Get system statistics", description = "Retrieve overall system statistics; ADMIN may filter by department")
    public ResponseEntity<StatisticsResponse> getStatistics(
        @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId
    ) {
        return ResponseEntity.ok(reportService.getStatistics(departmentId));
    }

    @GetMapping("/students-per-course")
    @Operation(summary = "Get students per course", description = "Retrieve count of enrolled students per course")
    public ResponseEntity<List<StudentsPerCourseResponse>> getStudentsPerCourse(
        @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId
    ) {
        return ResponseEntity.ok(reportService.getStudentsPerCourse(departmentId));
    }

    @GetMapping(value = "/students-per-course/export", produces = "text/csv")
    @Operation(summary = "Export students per course as CSV")
    public ResponseEntity<byte[]> exportStudentsPerCourse(
        @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId
    ) {
        return csvResponse(reportService.exportStudentsPerCourseCsv(departmentId), "students-per-course.csv");
    }

    @GetMapping(value = "/active-courses/export", produces = "text/csv")
    @Operation(summary = "Export active courses as CSV")
    public ResponseEntity<byte[]> exportActiveCourses(
        @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId
    ) {
        return csvResponse(reportService.exportActiveCoursesCsv(departmentId), "active-courses.csv");
    }

    @GetMapping(value = "/graduation-progress/export", produces = "text/csv")
    @Operation(summary = "Export graduation progress as CSV")
    public ResponseEntity<byte[]> exportGraduationProgress(
        @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId,
        @Parameter(description = "Year") @RequestParam(required = false) Integer year
    ) {
        return csvResponse(
            reportService.exportGraduationProgressCsv(departmentId, year),
            "graduation-progress.csv"
        );
    }

    private ResponseEntity<byte[]> csvResponse(String csv, String filename) {
        byte[] body = csv.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
            .body(body);
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
