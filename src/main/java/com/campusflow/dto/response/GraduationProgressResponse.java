package com.campusflow.dto.response;

import lombok.*;

import java.math.BigDecimal;

/**
 * Response DTO for graduation progress reporting.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraduationProgressResponse {

    private Integer totalStudents;
    private Integer graduatedStudents;
    private Integer expectedGraduates;
    private BigDecimal graduationRate;
    private BigDecimal averageGpa;
}
