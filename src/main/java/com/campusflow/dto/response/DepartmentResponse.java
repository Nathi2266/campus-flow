package com.campusflow.dto.response;

import lombok.*;

/**
 * Response DTO for department data.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentResponse {

    private Long id;
    private String name;
    private String description;
    private java.time.LocalDateTime createdAt;
}
