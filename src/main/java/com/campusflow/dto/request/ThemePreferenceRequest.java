package com.campusflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

/**
 * Request to update the current user's UI theme preference.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThemePreferenceRequest {

    @NotBlank(message = "Theme is required")
    @Pattern(regexp = "light|dark", message = "Theme must be light or dark")
    private String preferredTheme;
}
