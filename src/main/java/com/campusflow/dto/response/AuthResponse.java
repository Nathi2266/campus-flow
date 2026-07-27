package com.campusflow.dto.response;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Response DTO for authentication data.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private LocalDateTime expiresAt;
    private UserResponse user;
}
