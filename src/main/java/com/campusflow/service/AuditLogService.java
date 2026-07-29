package com.campusflow.service;

import com.campusflow.domain.AuditLog;
import com.campusflow.dto.response.AuditLogResponse;
import com.campusflow.dto.response.PagedResponse;
import com.campusflow.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Read-only audit log service.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public PagedResponse<AuditLogResponse> listAuditLogs(Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page != null ? page : 0, size != null ? size : 20);
        Page<AuditLog> logPage = auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);

        return PagedResponse.<AuditLogResponse>builder()
            .content(logPage.getContent().stream().map(this::toResponse).toList())
            .page(logPage.getNumber())
            .size(logPage.getSize())
            .totalElements(logPage.getTotalElements())
            .totalPages(logPage.getTotalPages())
            .isFirst(logPage.isFirst())
            .isLast(logPage.isLast())
            .hasContent(logPage.hasContent())
            .build();
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return AuditLogResponse.builder()
            .id(log.getId())
            .userId(log.getUser() != null ? log.getUser().getId() : null)
            .userEmail(log.getUser() != null ? log.getUser().getEmail() : null)
            .action(log.getAction())
            .entityType(log.getEntityType())
            .entityId(log.getEntityId())
            .details(log.getDetails())
            .ipAddress(log.getIpAddress())
            .userAgent(log.getUserAgent())
            .createdAt(log.getCreatedAt() != null ? log.getCreatedAt().toLocalDateTime() : null)
            .build();
    }
}
