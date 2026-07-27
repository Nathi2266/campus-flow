package com.campusflow.repository;

import com.campusflow.domain.Student;
import com.campusflow.domain.enums.AcademicStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Student entity.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    boolean existsByStudentNumber(String studentNumber);

    boolean existsByUserId(Long userId);

    Optional<Student> findByStudentNumber(String studentNumber);

    Optional<Student> findByUserId(Long userId);

    Page<Student> findByDepartmentId(Long departmentId, Pageable pageable);

    Page<Student> findByAcademicStatus(AcademicStatus status, Pageable pageable);

    Page<Student> findByDepartmentIdAndAcademicStatus(Long departmentId, AcademicStatus status, Pageable pageable);

    @Query("SELECT s FROM Student s WHERE s.department.id = :departmentId " +
           "AND (s.firstName LIKE %:search% OR s.lastName LIKE %:search% OR s.studentNumber LIKE %:search%)")
    Page<Student> searchByDepartment(@Param("departmentId") Long departmentId,
                                     @Param("search") String search,
                                     Pageable pageable);
}
