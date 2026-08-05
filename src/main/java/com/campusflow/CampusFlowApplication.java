package com.campusflow;

import com.campusflow.config.CampusFlowProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application entry point for CampusFlow.
 * <p>
 * Student Management System for universities.
 * </p>
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
@EnableConfigurationProperties(CampusFlowProperties.class)
public class CampusFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusFlowApplication.class, args);
    }
}
