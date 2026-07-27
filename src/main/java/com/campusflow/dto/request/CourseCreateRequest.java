package com.campusflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Request DTO for creating a new course.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseCreateRequest {

    @NotBlank(message = "Course code is required")
    private String code;

    @NotBlank(message = "Course name is required")
    private String name;

    private String description;

    @NotNull(message = "Credits is required")
    private Integer credits;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    private Long lecturerId;

    @NotNull(message = "Maximum capacity is required")
    private Integer maxCapacity = 30;
}
