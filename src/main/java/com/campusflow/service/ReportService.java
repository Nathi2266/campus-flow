package com.campusflow.service;

import com.campusflow.domain.Course;
import com.campusflow.domain.enums.AcademicStatus;
import com.campusflow.dto.response.*;
import com.campusflow.repository.CourseRepository;
import com.campusflow.repository.DepartmentRepository;
import com.campusflow.repository.EnrollmentRepository;
import com.campusflow.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Service class for Reports and Statistics.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final DepartmentRepository departmentRepository;

    public StatisticsResponse getStatistics() {
        long totalStudents = studentRepository.count();
        long graduated = studentRepository.countByAcademicStatus(AcademicStatus.GRADUATED);
        BigDecimal graduationRate = totalStudents == 0
            ? BigDecimal.ZERO
            : BigDecimal.valueOf(graduated)
                .divide(BigDecimal.valueOf(totalStudents), 4, RoundingMode.HALF_UP);

        return StatisticsResponse.builder()
            .totalStudents(totalStudents)
            .totalCourses(courseRepository.count())
            .activeCourses((int) courseRepository.countByActiveTrue())
            .totalEnrollments(enrollmentRepository.count())
            .totalDepartments(departmentRepository.count())
            .graduationRate(graduationRate)
            .build();
    }

    public List<StudentsPerCourseResponse> getStudentsPerCourse(Long departmentId) {
        List<Course> courses = departmentId != null
            ? courseRepository.findByDepartmentId(departmentId)
            : courseRepository.findAll();

        return courses.stream()
            .map(course -> StudentsPerCourseResponse.builder()
                .courseId(course.getId())
                .courseCode(course.getCode())
                .courseName(course.getName())
                .enrolledStudents(courseRepository.countActiveEnrollments(course.getId()))
                .build())
            .toList();
    }

    public GraduationProgressResponse getGraduationProgress(Long departmentId, Integer year) {
        long totalStudents;
        long graduatedStudents;

        if (departmentId != null) {
            totalStudents = studentRepository.countByUserDepartmentId(departmentId);
            graduatedStudents = studentRepository.countByUserDepartmentIdAndAcademicStatus(
                departmentId, AcademicStatus.GRADUATED);
        } else {
            totalStudents = studentRepository.count();
            graduatedStudents = studentRepository.countByAcademicStatus(AcademicStatus.GRADUATED);
        }

        long expectedGraduates = studentRepository.countByAcademicStatus(AcademicStatus.ACTIVE);
        BigDecimal graduationRate = totalStudents == 0
            ? BigDecimal.ZERO
            : BigDecimal.valueOf(graduatedStudents)
                .divide(BigDecimal.valueOf(totalStudents), 4, RoundingMode.HALF_UP);

        BigDecimal averageGpa = studentRepository.findAverageGpa().orElse(BigDecimal.ZERO);

        return GraduationProgressResponse.builder()
            .totalStudents((int) totalStudents)
            .graduatedStudents((int) graduatedStudents)
            .expectedGraduates((int) expectedGraduates)
            .graduationRate(graduationRate)
            .averageGpa(averageGpa)
            .build();
    }

    public List<ActiveCourseResponse> getActiveCourses(Long departmentId) {
        List<Course> courses = departmentId != null
            ? courseRepository.findByDepartmentIdAndActiveTrue(departmentId)
            : courseRepository.findByActiveTrue();

        return courses.stream()
            .map(course -> ActiveCourseResponse.builder()
                .courseId(course.getId())
                .courseCode(course.getCode())
                .courseName(course.getName())
                .enrolledCount(courseRepository.countActiveEnrollments(course.getId()))
                .maxCapacity(course.getMaxCapacity())
                .build())
            .toList();
    }

    public List<CourseResponse> getInactiveCourses(Long departmentId) {
        List<Course> courses = departmentId != null
            ? courseRepository.findByDepartmentIdAndActiveFalse(departmentId)
            : courseRepository.findByActiveFalse();

        return courses.stream()
            .map(this::toCourseResponse)
            .toList();
    }

    private CourseResponse toCourseResponse(Course course) {
        Integer enrolledCount = courseRepository.countActiveEnrollments(course.getId());
        return CourseResponse.builder()
            .id(course.getId())
            .code(course.getCode())
            .name(course.getName())
            .description(course.getDescription())
            .credits(course.getCredits())
            .departmentId(course.getDepartment().getId())
            .departmentName(course.getDepartment().getName())
            .lecturerId(course.getLecturer() != null ? course.getLecturer().getId() : null)
            .lecturerName(course.getLecturer() != null
                ? course.getLecturer().getFirstName() + " " + course.getLecturer().getLastName()
                : null)
            .maxCapacity(course.getMaxCapacity())
            .enrolledCount(enrolledCount)
            .active(Boolean.TRUE.equals(course.getActive()))
            .createdAt(course.getCreatedAt() != null ? course.getCreatedAt().toLocalDateTime() : null)
            .updatedAt(course.getUpdatedAt() != null ? course.getUpdatedAt().toLocalDateTime() : null)
            .build();
    }
}
