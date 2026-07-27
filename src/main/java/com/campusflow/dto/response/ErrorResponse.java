package com.campusflow.dto.response;

import lombok.*;

import java.time.OffsetDateTime;

/**
 * Response DTO for error responses (RFC7807 Problem Details).
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private Integer status;
    private String error;
    private String message;
    private String path;
    private OffsetDateTime timestamp;
    private String errorCode;
    private String details;
}
