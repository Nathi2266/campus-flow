package com.campusflow.web.api;

import com.campusflow.dto.response.AuditLogResponse;
import com.campusflow.dto.response.PagedResponse;
import com.campusflow.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for audit log viewing (ADMIN).
 */
@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Audit", description = "Audit log viewer")
public class AuditController {

    private final AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "List audit logs")
    public ResponseEntity<PagedResponse<AuditLogResponse>> listAuditLogs(
        @Parameter(description = "Page number") @RequestParam(defaultValue = "0") Integer page,
        @Parameter(description = "Page size") @RequestParam(defaultValue = "20") Integer size
    ) {
        return ResponseEntity.ok(auditLogService.listAuditLogs(page, size));
    }
}
