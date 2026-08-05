package com.campusflow.config;

import com.campusflow.domain.User;
import com.campusflow.domain.enums.UserRole;
import com.campusflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Creates the first ADMIN when the database has no users.
 * Credentials come from env — never baked-in campus/demo accounts.
 */
@Component
@Order(100)
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrap implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CampusFlowProperties properties;

    @Override
    public void run(ApplicationArguments args) {
        CampusFlowProperties.Bootstrap bootstrap = properties.getBootstrap();
        if (!bootstrap.isEnabled()) {
            return;
        }
        if (userRepository.count() > 0) {
            return;
        }

        String email = bootstrap.getAdminEmail() == null ? "" : bootstrap.getAdminEmail().trim();
        String password = bootstrap.getAdminPassword() == null ? "" : bootstrap.getAdminPassword();
        if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            log.warn(
                "Database has no users. Set CAMPUSFLOW_BOOTSTRAP_ADMIN_EMAIL and "
                    + "CAMPUSFLOW_BOOTSTRAP_ADMIN_PASSWORD to create the first ADMIN, "
                    + "or enable CAMPUSFLOW_SEED_DEMO=true for the optional demo pack."
            );
            return;
        }
        if (password.length() < 8) {
            log.error("Bootstrap admin password must be at least 8 characters — skipping.");
            return;
        }

        User admin = User.builder()
            .email(email.toLowerCase())
            .passwordHash(passwordEncoder.encode(password))
            .firstName(StringUtils.hasText(bootstrap.getAdminFirstName())
                ? bootstrap.getAdminFirstName() : "System")
            .lastName(StringUtils.hasText(bootstrap.getAdminLastName())
                ? bootstrap.getAdminLastName() : "Admin")
            .role(UserRole.ADMIN)
            .preferredTheme("light")
            .active(true)
            .notifyInApp(true)
            .build();
        userRepository.save(admin);
        log.info("Bootstrapped first ADMIN user: {}", admin.getEmail());
    }
}
