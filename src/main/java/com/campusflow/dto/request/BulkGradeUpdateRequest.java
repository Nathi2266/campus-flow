package com.campusflow.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkGradeUpdateRequest {

    @NotEmpty(message = "At least one grade is required")
    @Size(max = 100, message = "At most 100 grades per request")
    @Valid
    private List<BulkGradeItemRequest> grades;
}
