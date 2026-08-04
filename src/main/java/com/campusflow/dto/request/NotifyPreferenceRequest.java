package com.campusflow.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotifyPreferenceRequest {

    @NotNull(message = "notifyInApp is required")
    private Boolean notifyInApp;
}
