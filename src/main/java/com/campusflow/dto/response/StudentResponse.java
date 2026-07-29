package com.campusflow.dto.response;

import com.campusflow.domain.enums.AcademicStatus;
import lombok.*;

/**
 * Response DTO for student data.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {

    private Long id;
    private Long userId;
    private String studentNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private Long departmentId;
    private String departmentName;
    private java.time.LocalDate enrollmentDate;
    private AcademicStatus academicStatus;
    private java.math.BigDecimal gpa;
    private java.time.LocalDate graduationDate;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
    /** One-time temporary password; only set on create responses for ADMIN. */
    private String temporaryPassword;
}
