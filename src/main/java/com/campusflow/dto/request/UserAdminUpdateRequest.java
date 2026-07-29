package com.campusflow.dto.request;

import lombok.*;

/**
 * Request DTO for ADMIN user role/department update.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminUpdateRequest {

    private String role;

    private Long departmentId;
}
