package com.campusflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Request DTO for updating an enrollment grade.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeUpdateRequest {

    @NotBlank(message = "Grade is required")
    @Size(max = 5, message = "Grade must be at most 5 characters")
    private String grade;

    /** Optional enrollment status: COMPLETED, FAILED, ACTIVE, DROPPED */
    private String status;
}
