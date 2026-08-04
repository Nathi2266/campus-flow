package com.campusflow.dto.response;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkGradeUpdateResponse {
    private List<EnrollmentResponse> updated;
    private List<BulkGradeErrorResponse> errors;
    private int successCount;
}
