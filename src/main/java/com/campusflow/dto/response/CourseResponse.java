package com.campusflow.dto.response;

import lombok.*;

/**
 * Response DTO for course data.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {

    private Long id;
    private String code;
    private String name;
    private String description;
    private Integer credits;
    private Long departmentId;
    private String departmentName;
    private Long lecturerId;
    private String lecturerName;
    private Integer maxCapacity;
    private Integer enrolledCount;
    private Boolean active;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}
