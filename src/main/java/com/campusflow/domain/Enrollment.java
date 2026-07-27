package com.campusflow.domain;

import com.campusflow.domain.audit.AuditBase;
import com.campusflow.domain.enums.EnrollmentStatus;
import jakarta.persistence.*;
import lombok.*;

/**
 * Enrollment entity representing student course enrollment.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Entity
@Table(name = "enrollments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "course_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Enrollment extends AuditBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "enrollment_date", nullable = false)
    private java.time.OffsetDateTime enrollmentDate = java.time.OffsetDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    @Column(name = "grade", length = 5)
    private String grade;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
