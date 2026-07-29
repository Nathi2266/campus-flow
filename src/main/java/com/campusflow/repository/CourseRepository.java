package com.campusflow.repository;

import com.campusflow.domain.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Course entity.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    boolean existsByCode(String code);

    Optional<Course> findByCode(String code);

    Page<Course> findByDepartmentId(Long departmentId, Pageable pageable);

    List<Course> findByDepartmentId(Long departmentId);

    Page<Course> findByLecturerId(Long lecturerId, Pageable pageable);

    Page<Course> findByLecturerIdAndActive(Long lecturerId, Boolean active, Pageable pageable);

    Page<Course> findByActive(Boolean active, Pageable pageable);

    Page<Course> findByDepartmentIdAndActive(Long departmentId, Boolean active, Pageable pageable);

    List<Course> findByActiveTrue();

    List<Course> findByActiveFalse();

    List<Course> findByDepartmentIdAndActiveTrue(Long departmentId);

    List<Course> findByDepartmentIdAndActiveFalse(Long departmentId);

    long countByActiveTrue();

    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.enrollments WHERE c.id = :id")
    Optional<Course> findByIdWithEnrollments(@Param("id") Long id);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.course.id = :courseId AND e.status = 'ACTIVE'")
    Integer countActiveEnrollments(@Param("courseId") Long courseId);
}
