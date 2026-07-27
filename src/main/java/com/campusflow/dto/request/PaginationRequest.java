package com.campusflow.dto.request;

import lombok.*;

/**
 * Request DTO for pagination parameters.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginationRequest {

    private Integer page = 0;
    private Integer size = 20;
    private String sort;
}
