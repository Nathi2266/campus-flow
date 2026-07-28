package com.campusflow.service;

import com.campusflow.domain.Course;
import com.campusflow.domain.Enrollment;
import com.campusflow.domain.Student;
import com.campusflow.domain.enums.EnrollmentStatus;
import com.campusflow.dto.request.EnrollmentCreateRequest;
import com.campusflow.dto.response.EnrollmentResponse;
import com.campusflow.dto.response.PagedResponse;
import com.campusflow.exception.NotFoundException;
import com.campusflow.exception.ValidationException;
import com.campusflow.repository.CourseRepository;
import com.campusflow.repository.EnrollmentRepository;
import com.campusflow.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class for Enrollment management.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Transactional
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    public EnrollmentResponse enrollStudent(EnrollmentCreateRequest request) {
        // Check if already enrolled
        if (enrollmentRepository.existsByStudentIdAndCourseId(request.getStudentId(), request.getCourseId())) {
            throw new ValidationException("Student already enrolled in this course", "enrollment", "ALREADY_ENROLLED");
        }

        // Get student
        Student student = studentRepository.findById(request.getStudentId())
            .orElseThrow(() -> new NotFoundException("Student not found", "studentId"));

        // Get course
        Course course = courseRepository.findById(request.getCourseId())
            .orElseThrow(() -> new NotFoundException("Course not found", "courseId"));

        // Check capacity
        Integer enrolledCount = courseRepository.countActiveEnrollments(course.getId());
        if (enrolledCount >= course.getMaxCapacity()) {
            throw new ValidationException("Course is full", "courseId", "COURSE_FULL");
        }

        // Check if student already has too many active enrollments
        Integer activeEnrollments = enrollmentRepository.countActiveEnrollments(student.getId());
        if (activeEnrollments >= 5) {
            throw new ValidationException("Student already enrolled in maximum number of courses", "studentId", "MAX_COURSES_REACHED");
        }

        // Create enrollment
        Enrollment enrollment = Enrollment.builder()
            .student(student)
            .course(course)
            .enrollmentDate(java.time.OffsetDateTime.now())
            .status(EnrollmentStatus.ACTIVE)
            .build();

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        return toResponse(savedEnrollment);
    }

    public EnrollmentResponse getEnrollment(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Enrollment not found", "id"));

        return toResponse(enrollment);
    }

    public void dropCourse(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Enrollment not found", "id"));

        enrollment.setStatus(EnrollmentStatus.DROPPED);
        enrollmentRepository.save(enrollment);
    }

    public void cancelEnrollment(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Enrollment not found", "id"));

        enrollment.setStatus(EnrollmentStatus.COMPLETED);
        enrollmentRepository.save(enrollment);
    }

    @Transactional(readOnly = true)
    public PagedResponse<EnrollmentResponse> listEnrollments(
        Integer page,
        Integer size,
        Long studentId,
        Long courseId,
        String status
    ) {
        Pageable pageable = createPageable(page, size, null);
        Page<Enrollment> enrollmentPage;

        EnrollmentStatus enrollmentStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                enrollmentStatus = EnrollmentStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                throw new ValidationException("Invalid enrollment status", "status", "INVALID_STATUS");
            }
        }

        if (studentId != null && enrollmentStatus != null) {
            enrollmentPage = enrollmentRepository.findByStudentIdAndStatus(studentId, enrollmentStatus, pageable);
        } else if (studentId != null) {
            enrollmentPage = enrollmentRepository.findByStudentId(studentId, pageable);
        } else if (courseId != null && enrollmentStatus != null) {
            enrollmentPage = enrollmentRepository.findByCourseIdAndStatus(courseId, enrollmentStatus, pageable);
        } else if (courseId != null) {
            enrollmentPage = enrollmentRepository.findByCourseId(courseId, pageable);
        } else {
            enrollmentPage = enrollmentRepository.findAll(pageable);
        }

        return PagedResponse.<EnrollmentResponse>builder()
            .content(enrollmentPage.getContent().stream().map(this::toResponse).toList())
            .page(enrollmentPage.getNumber())
            .size(enrollmentPage.getSize())
            .totalElements(enrollmentPage.getTotalElements())
            .totalPages(enrollmentPage.getTotalPages())
            .isFirst(enrollmentPage.isFirst())
            .isLast(enrollmentPage.isLast())
            .hasContent(enrollmentPage.hasContent())
            .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<EnrollmentResponse> listStudentEnrollments(Long studentId, Integer page, Integer size, String sort) {
        Pageable pageable = createPageable(page, size, sort);

        Page<Enrollment> enrollmentPage = enrollmentRepository.findByStudentId(studentId, pageable);

        return PagedResponse.<EnrollmentResponse>builder()
            .content(enrollmentPage.getContent().stream().map(this::toResponse).toList())
            .page(enrollmentPage.getNumber())
            .size(enrollmentPage.getSize())
            .totalElements(enrollmentPage.getTotalElements())
            .totalPages(enrollmentPage.getTotalPages())
            .isFirst(enrollmentPage.isFirst())
            .isLast(enrollmentPage.isLast())
            .hasContent(enrollmentPage.hasContent())
            .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<EnrollmentResponse> listCourseEnrollments(Long courseId, Integer page, Integer size, String sort) {
        Pageable pageable = createPageable(page, size, sort);

        Page<Enrollment> enrollmentPage = enrollmentRepository.findByCourseId(courseId, pageable);

        return PagedResponse.<EnrollmentResponse>builder()
            .content(enrollmentPage.getContent().stream().map(this::toResponse).toList())
            .page(enrollmentPage.getNumber())
            .size(enrollmentPage.getSize())
            .totalElements(enrollmentPage.getTotalElements())
            .totalPages(enrollmentPage.getTotalPages())
            .isFirst(enrollmentPage.isFirst())
            .isLast(enrollmentPage.isLast())
            .hasContent(enrollmentPage.hasContent())
            .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<EnrollmentResponse> listActiveEnrollmentsByCourse(Long courseId, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Enrollment> enrollmentPage = enrollmentRepository.findActiveEnrollmentsByCourse(courseId, pageable);

        return PagedResponse.<EnrollmentResponse>builder()
            .content(enrollmentPage.getContent().stream().map(this::toResponse).toList())
            .page(enrollmentPage.getNumber())
            .size(enrollmentPage.getSize())
            .totalElements(enrollmentPage.getTotalElements())
            .totalPages(enrollmentPage.getTotalPages())
            .isFirst(enrollmentPage.isFirst())
            .isLast(enrollmentPage.isLast())
            .hasContent(enrollmentPage.hasContent())
            .build();
    }

    private Pageable createPageable(Integer page, Integer size, String sort) {
        if (sort != null && !sort.isEmpty()) {
            String[] sortParts = sort.split(",");
            Sort.Direction direction = sortParts.length > 1 && "desc".equalsIgnoreCase(sortParts[1])
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
            return PageRequest.of(page, size, Sort.by(direction, sortParts[0]));
        }
        return PageRequest.of(page, size);
    }

    private EnrollmentResponse toResponse(Enrollment enrollment) {
        return EnrollmentResponse.builder()
            .id(enrollment.getId())
            .studentId(enrollment.getStudent().getId())
            .studentName(enrollment.getStudent().getFirstName() + " " + enrollment.getStudent().getLastName())
            .courseId(enrollment.getCourse().getId())
            .courseCode(enrollment.getCourse().getCode())
            .courseName(enrollment.getCourse().getName())
            .enrollmentDate(enrollment.getEnrollmentDate() != null
                ? enrollment.getEnrollmentDate().toLocalDateTime()
                : null)
            .status(enrollment.getStatus())
            .grade(enrollment.getGrade())
            .notes(enrollment.getNotes())
            .createdAt(enrollment.getCreatedAt().toLocalDateTime())
            .updatedAt(enrollment.getUpdatedAt().toLocalDateTime())
            .build();
    }
}
