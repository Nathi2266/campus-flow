package com.campusflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkGradeItemRequest {

    @NotNull(message = "Enrollment ID is required")
    private Long enrollmentId;

    @NotBlank(message = "Grade is required")
    @Size(max = 5, message = "Grade must be at most 5 characters")
    private String grade;

    private String status;
}
