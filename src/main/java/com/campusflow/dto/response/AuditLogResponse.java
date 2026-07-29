package com.campusflow.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Response DTO for audit log entries.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private Long id;
    private Long userId;
    private String userEmail;
    private String action;
    private String entityType;
    private Long entityId;
    private Map<String, Object> details;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;
}
