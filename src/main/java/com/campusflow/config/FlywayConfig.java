package com.campusflow.config;

import org.flywaydb.core.api.configuration.FluentConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayConfigurationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayConfig {

    @Bean
    public FlywayConfigurationCustomizer campusFlowFlywayCustomizer(CampusFlowProperties properties) {
        return (FluentConfiguration configuration) -> {
            if (properties.getSeed().isDemo()) {
                configuration.locations("classpath:db/migration", "classpath:db/demo-seed");
            } else {
                configuration.locations("classpath:db/migration");
            }
        };
    }
}
