package com.campusflow.util;

import com.campusflow.domain.User;
import com.campusflow.exception.ValidationException;
import com.campusflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Security helpers for resolving the current authenticated user.
 */
@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ValidationException("Not authenticated", "authentication", "UNAUTHORIZED");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        if (principal instanceof String email) {
            return email;
        }

        throw new ValidationException("Not authenticated", "authentication", "UNAUTHORIZED");
    }

    public User getCurrentUser() {
        return userRepository.findByEmail(getCurrentUserEmail())
            .orElseThrow(() -> new ValidationException("User not found", "authentication", "UNAUTHORIZED"));
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
