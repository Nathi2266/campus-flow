package com.campusflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Request DTO for updating course information.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseUpdateRequest {

    @NotBlank(message = "Course name is required")
    private String name;

    private String description;

    private Integer credits;

    private Long lecturerId;

    private Integer maxCapacity;
}
