package com.campusflow.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA configuration for CampusFlow.
 *
 * <p>Enables JPA auditing for audit fields.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
