package com.campusflow.config;

import org.springframework.context.annotation.Configuration;

/**
 * Web MVC configuration for CampusFlow.
 *
 * <p>CORS is owned exclusively by {@link SecurityConfig} (env-driven
 * {@code cors.allowed-origin-patterns}) so Spring Security and MVC never diverge.
 */
@Configuration
public class WebConfig {
}
