package com.campusflow.service;

import com.campusflow.domain.AuditLog;
import com.campusflow.domain.Course;
import com.campusflow.domain.Enrollment;
import com.campusflow.domain.Student;
import com.campusflow.domain.User;
import com.campusflow.domain.enums.EnrollmentStatus;
import com.campusflow.domain.enums.UserRole;
import com.campusflow.dto.request.BulkGradeItemRequest;
import com.campusflow.dto.request.BulkGradeUpdateRequest;
import com.campusflow.dto.request.EnrollmentCreateRequest;
import com.campusflow.dto.request.GradeUpdateRequest;
import com.campusflow.dto.response.BulkGradeErrorResponse;
import com.campusflow.dto.response.BulkGradeUpdateResponse;
import com.campusflow.dto.response.EnrollmentResponse;
import com.campusflow.dto.response.PagedResponse;
import com.campusflow.exception.NotFoundException;
import com.campusflow.exception.ValidationException;
import com.campusflow.repository.AuditLogRepository;
import com.campusflow.repository.CourseRepository;
import com.campusflow.repository.EnrollmentRepository;
import com.campusflow.repository.StudentRepository;
import com.campusflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
    private final SecurityUtils securityUtils;
    private final AuditLogRepository auditLogRepository;
    private final NotificationService notificationService;

    public EnrollmentResponse enrollStudent(EnrollmentCreateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Long studentId = request.getStudentId();

        if (currentUser.getRole() == UserRole.STUDENT) {
            Student ownStudent = requireLinkedStudent(currentUser);
            studentId = ownStudent.getId();
        } else if (studentId == null) {
            throw new ValidationException("Student ID is required", "studentId", "REQUIRED");
        }

        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, request.getCourseId())) {
            throw new ValidationException("Student already enrolled in this course", "enrollment", "ALREADY_ENROLLED");
        }

        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new NotFoundException("Student not found", "studentId"));

        Course course = courseRepository.findById(request.getCourseId())
            .orElseThrow(() -> new NotFoundException("Course not found", "courseId"));

        if (currentUser.getRole() == UserRole.LECTURER) {
            assertLecturerOwnsCourse(currentUser, course);
        }

        Integer enrolledCount = courseRepository.countActiveEnrollments(course.getId());
        if (enrolledCount >= course.getMaxCapacity()) {
            notificationService.notifyUser(
                currentUser,
                "COURSE_FULL",
                "Course is full",
                course.getCode() + " — " + course.getName() + " has no open seats.",
                "COURSE",
                course.getId()
            );
            throw new ValidationException("Course is full", "courseId", "COURSE_FULL");
        }

        Integer activeEnrollments = enrollmentRepository.countActiveEnrollments(student.getId());
        if (activeEnrollments >= 5) {
            throw new ValidationException("Student already enrolled in maximum number of courses", "studentId", "MAX_COURSES_REACHED");
        }

        Enrollment enrollment = Enrollment.builder()
            .student(student)
            .course(course)
            .enrollmentDate(java.time.OffsetDateTime.now())
            .status(EnrollmentStatus.ACTIVE)
            .build();

        Enrollment saved = enrollmentRepository.save(enrollment);
        auditLogRepository.save(AuditLog.builder()
            .user(currentUser)
            .action("ENROLLMENT_CREATE")
            .entityType("ENROLLMENT")
            .entityId(saved.getId())
            .details(Map.of(
                "studentId", studentId,
                "courseId", request.getCourseId()
            ))
            .build());
        if (course.getLecturer() != null) {
            notificationService.notifyUser(
                course.getLecturer(),
                "ENROLLMENT_CREATED",
                "New enrollment",
                student.getFirstName() + " " + student.getLastName()
                    + " enrolled in " + course.getCode() + ".",
                "ENROLLMENT",
                saved.getId()
            );
        }
        return toResponse(saved);
    }

    public EnrollmentResponse getEnrollment(Long id) {
        Enrollment enrollment = findEnrollment(id);
        assertCanViewEnrollment(securityUtils.getCurrentUser(), enrollment);
        return toResponse(enrollment);
    }

    public EnrollmentResponse updateGrade(Long id, GradeUpdateRequest request) {
        Enrollment saved = applyGradeUpdate(findEnrollment(id), request.getGrade(), request.getStatus());
        return toResponse(saved);
    }

    public BulkGradeUpdateResponse updateGradesBulk(BulkGradeUpdateRequest request) {
        List<EnrollmentResponse> updated = new ArrayList<>();
        List<BulkGradeErrorResponse> errors = new ArrayList<>();
        for (BulkGradeItemRequest item : request.getGrades()) {
            try {
                Enrollment enrollment = findEnrollment(item.getEnrollmentId());
                Enrollment saved = applyGradeUpdate(enrollment, item.getGrade(), item.getStatus());
                updated.add(toResponse(saved));
            } catch (NotFoundException | ValidationException ex) {
                String code = ex instanceof ValidationException ve && ve.getErrorCode() != null
                    ? ve.getErrorCode()
                    : (ex instanceof NotFoundException ? "NOT_FOUND" : "ERROR");
                errors.add(BulkGradeErrorResponse.builder()
                    .enrollmentId(item.getEnrollmentId())
                    .code(code)
                    .message(ex.getMessage())
                    .build());
            }
        }
        return BulkGradeUpdateResponse.builder()
            .updated(updated)
            .errors(errors)
            .successCount(updated.size())
            .build();
    }

    private Enrollment applyGradeUpdate(Enrollment enrollment, String rawGrade, String rawStatus) {
        User currentUser = securityUtils.getCurrentUser();

        if (currentUser.getRole() == UserRole.LECTURER) {
            assertLecturerOwnsCourse(currentUser, enrollment.getCourse());
        } else if (currentUser.getRole() != UserRole.ADMIN) {
            throw new ValidationException("Not allowed to update grades", "authorization", "FORBIDDEN");
        }

        String grade = rawGrade != null ? rawGrade.trim() : null;
        if (grade == null || grade.isBlank()) {
            throw new ValidationException("Grade is required", "grade", "GRADE_REQUIRED");
        }
        if (grade.length() > 5) {
            throw new ValidationException("Grade must be at most 5 characters", "grade", "GRADE_TOO_LONG");
        }

        enrollment.setGrade(grade);

        if (rawStatus != null && !rawStatus.isBlank()) {
            try {
                enrollment.setStatus(EnrollmentStatus.valueOf(rawStatus.trim().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                throw new ValidationException("Invalid enrollment status", "status", "INVALID_STATUS");
            }
        }

        Enrollment saved = enrollmentRepository.save(enrollment);
        auditLogRepository.save(AuditLog.builder()
            .user(currentUser)
            .action("GRADE_UPDATE")
            .entityType("ENROLLMENT")
            .entityId(saved.getId())
            .details(Map.of("grade", grade))
            .build());

        User studentUser = saved.getStudent() != null ? saved.getStudent().getUser() : null;
        Course course = saved.getCourse();
        notificationService.notifyUser(
            studentUser,
            "GRADE_POSTED",
            "Grade posted",
            (course != null ? course.getCode() + ": " : "") + "You received grade " + grade + ".",
            "ENROLLMENT",
            saved.getId()
        );
        return saved;
    }

    public void dropCourse(Long id) {
        Enrollment enrollment = findEnrollment(id);
        User currentUser = securityUtils.getCurrentUser();

        if (currentUser.getRole() == UserRole.STUDENT) {
            Student ownStudent = requireLinkedStudent(currentUser);
            if (!enrollment.getStudent().getId().equals(ownStudent.getId())) {
                throw new ValidationException("Cannot drop another student's enrollment", "id", "FORBIDDEN");
            }
        } else if (currentUser.getRole() == UserRole.LECTURER) {
            assertLecturerOwnsCourse(currentUser, enrollment.getCourse());
        }

        enrollment.setStatus(EnrollmentStatus.DROPPED);
        enrollmentRepository.save(enrollment);
        auditLogRepository.save(AuditLog.builder()
            .user(currentUser)
            .action("ENROLLMENT_DROP")
            .entityType("ENROLLMENT")
            .entityId(id)
            .details(Map.of())
            .build());
    }

    public void cancelEnrollment(Long id) {
        Enrollment enrollment = findEnrollment(id);
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
        User currentUser = securityUtils.getCurrentUser();
        Pageable pageable = createPageable(page, size, null);
        EnrollmentStatus enrollmentStatus = parseStatus(status);

        if (currentUser.getRole() == UserRole.STUDENT) {
            Student ownStudent = requireLinkedStudent(currentUser);
            studentId = ownStudent.getId();
            courseId = null;
        } else if (currentUser.getRole() == UserRole.LECTURER) {
            if (courseId != null) {
                Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new NotFoundException("Course not found", "courseId"));
                assertLecturerOwnsCourse(currentUser, course);
            } else {
                return toPagedResponse(
                    enrollmentStatus != null
                        ? enrollmentRepository.findByCourseLecturerIdAndStatus(
                            currentUser.getId(), enrollmentStatus, pageable)
                        : enrollmentRepository.findByCourseLecturerId(currentUser.getId(), pageable)
                );
            }
        }

        Page<Enrollment> enrollmentPage;
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

        return toPagedResponse(enrollmentPage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<EnrollmentResponse> listStudentEnrollments(
        Long studentId, Integer page, Integer size, String sort, String status
    ) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == UserRole.STUDENT) {
            Student ownStudent = requireLinkedStudent(currentUser);
            if (!ownStudent.getId().equals(studentId)) {
                throw new ValidationException("Cannot view another student's enrollments", "studentId", "FORBIDDEN");
            }
        } else if (currentUser.getRole() == UserRole.LECTURER) {
            // Lecturers may only see enrollments for their own courses
            Pageable pageable = createPageable(page, size, sort);
            EnrollmentStatus enrollmentStatus = parseStatus(status);
            Page<Enrollment> ownCoursePage = enrollmentStatus != null
                ? enrollmentRepository.findByCourseLecturerIdAndStatus(
                    currentUser.getId(), enrollmentStatus, pageable)
                : enrollmentRepository.findByCourseLecturerId(currentUser.getId(), pageable);
            List<Enrollment> filtered = ownCoursePage.getContent().stream()
                .filter(e -> e.getStudent().getId().equals(studentId))
                .toList();
            return toPagedResponse(new org.springframework.data.domain.PageImpl<>(
                filtered, pageable, filtered.size()));
        }

        Pageable pageable = createPageable(page, size, sort);
        EnrollmentStatus enrollmentStatus = parseStatus(status);
        Page<Enrollment> enrollmentPage = enrollmentStatus != null
            ? enrollmentRepository.findByStudentIdAndStatus(studentId, enrollmentStatus, pageable)
            : enrollmentRepository.findByStudentId(studentId, pageable);

        return toPagedResponse(enrollmentPage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<EnrollmentResponse> listCourseEnrollments(Long courseId, Integer page, Integer size, String sort) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == UserRole.STUDENT) {
            throw new ValidationException(
                "Students cannot view course rosters", "courseId", "FORBIDDEN");
        }
        if (currentUser.getRole() == UserRole.LECTURER) {
            Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Course not found", "courseId"));
            assertLecturerOwnsCourse(currentUser, course);
        }

        Pageable pageable = createPageable(page, size, sort);
        return toPagedResponse(enrollmentRepository.findByCourseId(courseId, pageable));
    }

    @Transactional(readOnly = true)
    public PagedResponse<EnrollmentResponse> listActiveEnrollmentsByCourse(Long courseId, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        return toPagedResponse(enrollmentRepository.findActiveEnrollmentsByCourse(courseId, pageable));
    }

    private Enrollment findEnrollment(Long id) {
        return enrollmentRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Enrollment not found", "id"));
    }

    private Student requireLinkedStudent(User user) {
        return studentRepository.findByUserId(user.getId())
            .orElseThrow(() -> new ValidationException("No student record linked to user", "student", "STUDENT_NOT_LINKED"));
    }

    private void assertLecturerOwnsCourse(User lecturer, Course course) {
        if (course.getLecturer() == null || !course.getLecturer().getId().equals(lecturer.getId())) {
            throw new ValidationException("Not allowed for this course", "courseId", "FORBIDDEN");
        }
    }

    private void assertCanViewEnrollment(User user, Enrollment enrollment) {
        if (user.getRole() == UserRole.ADMIN) {
            return;
        }
        if (user.getRole() == UserRole.STUDENT) {
            Student ownStudent = requireLinkedStudent(user);
            if (!enrollment.getStudent().getId().equals(ownStudent.getId())) {
                throw new ValidationException("Cannot view this enrollment", "id", "FORBIDDEN");
            }
            return;
        }
        if (user.getRole() == UserRole.LECTURER) {
            assertLecturerOwnsCourse(user, enrollment.getCourse());
        }
    }

    private EnrollmentStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return EnrollmentStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ValidationException("Invalid enrollment status", "status", "INVALID_STATUS");
        }
    }

    private Pageable createPageable(Integer page, Integer size, String sort) {
        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 20;
        if (sort != null && !sort.isEmpty()) {
            String[] sortParts = sort.split(",");
            Sort.Direction direction = sortParts.length > 1 && "desc".equalsIgnoreCase(sortParts[1])
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
            return PageRequest.of(pageNum, pageSize, Sort.by(direction, sortParts[0]));
        }
        return PageRequest.of(pageNum, pageSize, Sort.by(Sort.Direction.DESC, "id"));
    }

    private PagedResponse<EnrollmentResponse> toPagedResponse(Page<Enrollment> enrollmentPage) {
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
