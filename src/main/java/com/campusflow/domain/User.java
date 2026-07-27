package com.campusflow.domain;

import com.campusflow.domain.audit.AuditBase;
import com.campusflow.domain.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

/**
 * User entity representing system users (Admin, Lecturer, Student).
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User extends AuditBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "phone", length = 20)
    private String phoneNumber;

    // One-to-one relationship with Student
    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Student student;

    // One-to-many relationship with courses (as lecturer)
    @OneToMany(mappedBy = "lecturer", fetch = FetchType.LAZY)
    private Set<Course> coursesAsLecturer = new HashSet<>();
}
