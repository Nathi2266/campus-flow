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
    /** Linked student profile id when role is STUDENT; otherwise null. */
    private Long studentId;
    /** UI color mode: light or dark. */
    private String preferredTheme;
    /** Soft account status. */
    private Boolean active;
    /** One-time temporary password returned only on create when server-generated. */
    private String temporaryPassword;
}
