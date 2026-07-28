package com.campusflow.dto.response;

import lombok.*;

import java.math.BigDecimal;

/**
 * Response DTO for overall system statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsResponse {

    private Long totalStudents;
    private Long totalCourses;
    private Integer activeCourses;
    private Long totalEnrollments;
    private Long totalDepartments;
    private BigDecimal graduationRate;
}
