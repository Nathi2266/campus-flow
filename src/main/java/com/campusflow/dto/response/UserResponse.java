package com.campusflow.dto.response;

import lombok.*;

/**
 * Response DTO for user data.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private Long departmentId;
    private String phoneNumber;
}
