package com.campusflow.dto.response;

import lombok.*;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String body;
    private String entityType;
    private Long entityId;
    private OffsetDateTime readAt;
    private OffsetDateTime createdAt;
    private boolean unread;
}
