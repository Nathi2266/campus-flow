package com.campusflow.service;

import com.campusflow.domain.Course;
import com.campusflow.domain.User;
import com.campusflow.domain.enums.AcademicStatus;
import com.campusflow.domain.enums.UserRole;
import com.campusflow.dto.response.*;
import com.campusflow.repository.CourseRepository;
import com.campusflow.repository.DepartmentRepository;
import com.campusflow.repository.EnrollmentRepository;
import com.campusflow.repository.StudentRepository;
import com.campusflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Reports and statistics — ADMIN org/dept scope; LECTURER own courses only.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final DepartmentRepository departmentRepository;
    private final SecurityUtils securityUtils;

    public StatisticsResponse getStatistics(Long departmentId) {
        User current = securityUtils.getCurrentUser();
        if (current.getRole() == UserRole.LECTURER) {
            return lecturerStatistics(current.getId());
        }

        if (departmentId != null) {
            long totalStudents = studentRepository.countByUserDepartmentId(departmentId);
            long graduated = studentRepository.countByUserDepartmentIdAndAcademicStatus(
                departmentId, AcademicStatus.GRADUATED);
            return StatisticsResponse.builder()
                .totalStudents(totalStudents)
                .totalCourses(courseRepository.countByDepartmentId(departmentId))
                .activeCourses((int) courseRepository.countByDepartmentIdAndActiveTrue(departmentId))
                .totalEnrollments(enrollmentRepository.countByCourseDepartmentId(departmentId))
                .totalDepartments(1L)
                .graduationRate(rate(graduated, totalStudents))
                .build();
        }

        long totalStudents = studentRepository.count();
        long graduated = studentRepository.countByAcademicStatus(AcademicStatus.GRADUATED);
        BigDecimal graduationRate = rate(graduated, totalStudents);

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
        List<Course> courses = resolveCourses(departmentId, null);
        return courses.stream()
            .map(course -> StudentsPerCourseResponse.builder()
                .courseId(course.getId())
                .courseCode(course.getCode())
                .courseName(course.getName())
                .enrolledStudents(courseRepository.countActiveEnrollments(course.getId()))
                .build())
            .toList();
    }

    /** CSV export of students-per-course (same scope rules as JSON endpoint). */
    public String exportStudentsPerCourseCsv(Long departmentId) {
        StringBuilder csv = new StringBuilder("courseId,courseCode,courseName,enrolledStudents\n");
        for (StudentsPerCourseResponse row : getStudentsPerCourse(departmentId)) {
            csv.append(row.getCourseId()).append(',')
                .append(csvEscape(row.getCourseCode())).append(',')
                .append(csvEscape(row.getCourseName())).append(',')
                .append(row.getEnrolledStudents() != null ? row.getEnrolledStudents() : 0)
                .append('\n');
        }
        return csv.toString();
    }

    public String exportActiveCoursesCsv(Long departmentId) {
        StringBuilder csv = new StringBuilder("courseId,courseCode,courseName,enrolledCount,maxCapacity\n");
        for (ActiveCourseResponse row : getActiveCourses(departmentId)) {
            csv.append(row.getCourseId()).append(',')
                .append(csvEscape(row.getCourseCode())).append(',')
                .append(csvEscape(row.getCourseName())).append(',')
                .append(row.getEnrolledCount() != null ? row.getEnrolledCount() : 0).append(',')
                .append(row.getMaxCapacity() != null ? row.getMaxCapacity() : 0)
                .append('\n');
        }
        return csv.toString();
    }

    public String exportGraduationProgressCsv(Long departmentId, Integer year) {
        GraduationProgressResponse row = getGraduationProgress(departmentId, year);
        return "totalStudents,graduatedStudents,expectedGraduates,graduationRate,averageGpa\n"
            + (row.getTotalStudents() != null ? row.getTotalStudents() : 0) + ','
            + (row.getGraduatedStudents() != null ? row.getGraduatedStudents() : 0) + ','
            + (row.getExpectedGraduates() != null ? row.getExpectedGraduates() : 0) + ','
            + (row.getGraduationRate() != null ? row.getGraduationRate() : "0") + ','
            + (row.getAverageGpa() != null ? row.getAverageGpa() : "0")
            + '\n';
    }

    private String csvEscape(String value) {
        if (value == null) {
            return "";
        }
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    public GraduationProgressResponse getGraduationProgress(Long departmentId, Integer year) {
        User current = securityUtils.getCurrentUser();
        if (current.getRole() == UserRole.LECTURER) {
            // Course-centric: students enrolled in own courses
            long totalStudents = enrollmentRepository.countDistinctStudentsByCourseLecturerId(current.getId());
            long graduatedStudents = enrollmentRepository.countDistinctStudentsByCourseLecturerIdAndAcademicStatus(
                current.getId(), AcademicStatus.GRADUATED);
            BigDecimal averageGpa = enrollmentRepository.findAverageGpaByCourseLecturerId(current.getId())
                .orElse(BigDecimal.ZERO);
            return GraduationProgressResponse.builder()
                .totalStudents((int) totalStudents)
                .graduatedStudents((int) graduatedStudents)
                .expectedGraduates((int) Math.max(0, totalStudents - graduatedStudents))
                .graduationRate(rate(graduatedStudents, totalStudents))
                .averageGpa(averageGpa)
                .build();
        }

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
        BigDecimal averageGpa = studentRepository.findAverageGpa().orElse(BigDecimal.ZERO);

        return GraduationProgressResponse.builder()
            .totalStudents((int) totalStudents)
            .graduatedStudents((int) graduatedStudents)
            .expectedGraduates((int) expectedGraduates)
            .graduationRate(rate(graduatedStudents, totalStudents))
            .averageGpa(averageGpa)
            .build();
    }

    public List<ActiveCourseResponse> getActiveCourses(Long departmentId) {
        List<Course> courses = resolveCourses(departmentId, true);
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
        List<Course> courses = resolveCourses(departmentId, false);
        return courses.stream().map(this::toCourseResponse).toList();
    }

    private StatisticsResponse lecturerStatistics(Long lecturerId) {
        long totalCourses = courseRepository.countByLecturerId(lecturerId);
        long activeCourses = courseRepository.countByLecturerIdAndActiveTrue(lecturerId);
        long totalEnrollments = enrollmentRepository.countByCourseLecturerId(lecturerId);
        long totalStudents = enrollmentRepository.countDistinctStudentsByCourseLecturerId(lecturerId);
        long graduated = enrollmentRepository.countDistinctStudentsByCourseLecturerIdAndAcademicStatus(
            lecturerId, AcademicStatus.GRADUATED);

        return StatisticsResponse.builder()
            .totalStudents(totalStudents)
            .totalCourses(totalCourses)
            .activeCourses((int) activeCourses)
            .totalEnrollments(totalEnrollments)
            .totalDepartments(1L)
            .graduationRate(rate(graduated, totalStudents))
            .build();
    }

    private List<Course> resolveCourses(Long departmentId, Boolean active) {
        User current = securityUtils.getCurrentUser();
        if (current.getRole() == UserRole.LECTURER) {
            if (Boolean.TRUE.equals(active)) {
                return courseRepository.findByLecturerIdAndActiveTrue(current.getId());
            }
            if (Boolean.FALSE.equals(active)) {
                return courseRepository.findByLecturerIdAndActiveFalse(current.getId());
            }
            return courseRepository.findByLecturerId(current.getId());
        }

        if (departmentId != null) {
            if (Boolean.TRUE.equals(active)) {
                return courseRepository.findByDepartmentIdAndActiveTrue(departmentId);
            }
            if (Boolean.FALSE.equals(active)) {
                return courseRepository.findByDepartmentIdAndActiveFalse(departmentId);
            }
            return courseRepository.findByDepartmentId(departmentId);
        }

        if (Boolean.TRUE.equals(active)) {
            return courseRepository.findByActiveTrue();
        }
        if (Boolean.FALSE.equals(active)) {
            return courseRepository.findByActiveFalse();
        }
        return courseRepository.findAll();
    }

    private BigDecimal rate(long numerator, long denominator) {
        if (denominator == 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(numerator)
            .divide(BigDecimal.valueOf(denominator), 4, RoundingMode.HALF_UP);
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
