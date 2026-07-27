package com.campusflow.dto.response;

import com.campusflow.domain.enums.EnrollmentStatus;
import lombok.*;

/**
 * Response DTO for enrollment data.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private java.time.LocalDateTime enrollmentDate;
    private EnrollmentStatus status;
    private String grade;
    private String notes;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}
