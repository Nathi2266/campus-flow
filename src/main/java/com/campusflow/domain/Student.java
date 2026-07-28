package com.campusflow.domain;

import com.campusflow.domain.audit.AuditBase;
import com.campusflow.domain.enums.AcademicStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Student entity representing enrolled students.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Entity
@Table(name = "students", uniqueConstraints = {
    @UniqueConstraint(columnNames = "user_id"),
    @UniqueConstraint(columnNames = "student_number")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Student extends AuditBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "student_number", nullable = false, length = 50)
    private String studentNumber;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "enrollment_date", nullable = false)
    private java.time.LocalDate enrollmentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "academic_status", nullable = false, length = 20)
    private AcademicStatus academicStatus = AcademicStatus.ACTIVE;

    @Column(name = "gpa", precision = 3, scale = 2)
    private java.math.BigDecimal gpa;

    @Column(name = "graduation_date")
    private java.time.LocalDate graduationDate;

    // One-to-many relationship with enrollments
    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Set<Enrollment> enrollments = new HashSet<>();
}
