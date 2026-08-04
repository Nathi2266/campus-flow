package com.campusflow.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkGradeErrorResponse {
    private Long enrollmentId;
    private String code;
    private String message;
}
