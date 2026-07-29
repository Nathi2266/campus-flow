package com.campusflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Request DTO for updating a department.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentUpdateRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100)
    private String name;

    private String description;
}
