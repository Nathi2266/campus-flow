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

    List<Course> findByLecturerId(Long lecturerId);

    List<Course> findByLecturerIdAndActiveTrue(Long lecturerId);

    List<Course> findByLecturerIdAndActiveFalse(Long lecturerId);

    long countByActiveTrue();

    long countByDepartmentId(Long departmentId);

    long countByDepartmentIdAndActiveTrue(Long departmentId);

    long countByLecturerId(Long lecturerId);

    long countByLecturerIdAndActiveTrue(Long lecturerId);

    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.enrollments WHERE c.id = :id")
    Optional<Course> findByIdWithEnrollments(@Param("id") Long id);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.course.id = :courseId AND e.status = 'ACTIVE'")
    Integer countActiveEnrollments(@Param("courseId") Long courseId);

    @Query("SELECT c FROM Course c WHERE " +
        "(:search IS NULL OR :search = '' OR LOWER(c.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
        "OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
        "(:departmentId IS NULL OR c.department.id = :departmentId) AND " +
        "(:lecturerId IS NULL OR c.lecturer.id = :lecturerId) AND " +
        "(:active IS NULL OR c.active = :active)")
    Page<Course> searchFiltered(
        @Param("search") String search,
        @Param("departmentId") Long departmentId,
        @Param("lecturerId") Long lecturerId,
        @Param("active") Boolean active,
        Pageable pageable
    );
}
