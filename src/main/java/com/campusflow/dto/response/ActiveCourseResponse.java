package com.campusflow.dto.response;

import lombok.*;

/**
 * Response DTO for active course reporting.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveCourseResponse {

    private Long courseId;
    private String courseCode;
    private String courseName;
    private Integer enrolledCount;
    private Integer maxCapacity;
}
