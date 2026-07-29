package com.campusflow.service;

import com.campusflow.domain.Course;
import com.campusflow.domain.Department;
import com.campusflow.domain.User;
import com.campusflow.domain.enums.UserRole;
import com.campusflow.dto.request.CourseCreateRequest;
import com.campusflow.dto.request.CourseUpdateRequest;
import com.campusflow.dto.response.CourseResponse;
import com.campusflow.dto.response.PagedResponse;
import com.campusflow.exception.NotFoundException;
import com.campusflow.exception.ValidationException;
import com.campusflow.repository.CourseRepository;
import com.campusflow.repository.DepartmentRepository;
import com.campusflow.repository.UserRepository;
import com.campusflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class for Course management.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final SecurityUtils securityUtils;

    public CourseResponse createCourse(CourseCreateRequest request) {
        if (courseRepository.existsByCode(request.getCode())) {
            throw new ValidationException("Course code already exists", "code", "COURSE_CODE_EXISTS");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new NotFoundException("Department not found", "departmentId"));

        User lecturer = null;
        if (request.getLecturerId() != null) {
            lecturer = userRepository.findById(request.getLecturerId())
                .orElseThrow(() -> new NotFoundException("Lecturer not found", "lecturerId"));
        }

        Course course = Course.builder()
            .code(request.getCode())
            .name(request.getName())
            .description(request.getDescription())
            .credits(request.getCredits())
            .department(department)
            .lecturer(lecturer)
            .maxCapacity(request.getMaxCapacity())
            .active(true)
            .build();

        return toResponse(courseRepository.save(course));
    }

    public CourseResponse getCourse(Long id) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Course not found", "id"));
        return toResponse(course);
    }

    public CourseResponse updateCourse(Long id, CourseUpdateRequest request) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Course not found", "id"));

        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == UserRole.LECTURER) {
            if (course.getLecturer() == null || !course.getLecturer().getId().equals(currentUser.getId())) {
                throw new ValidationException("Lecturers may only update their own courses", "id", "FORBIDDEN");
            }
        }

        course.setName(request.getName());
        course.setDescription(request.getDescription());
        course.setCredits(request.getCredits());
        course.setMaxCapacity(request.getMaxCapacity());

        if (request.getLecturerId() != null && currentUser.getRole() == UserRole.ADMIN) {
            User lecturer = userRepository.findById(request.getLecturerId())
                .orElseThrow(() -> new NotFoundException("Lecturer not found", "lecturerId"));
            course.setLecturer(lecturer);
        }

        return toResponse(courseRepository.save(course));
    }

    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Course not found", "id"));
        course.setActive(false);
        courseRepository.save(course);
    }

    public CourseResponse activateCourse(Long id) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Course not found", "id"));
        course.setActive(true);
        courseRepository.save(course);
        return toResponse(course);
    }

    public CourseResponse deactivateCourse(Long id) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Course not found", "id"));
        course.setActive(false);
        courseRepository.save(course);
        return toResponse(course);
    }

    @Transactional(readOnly = true)
    public PagedResponse<CourseResponse> listCourses(Integer page, Integer size, String sort,
                                                     Long departmentId, Long lecturerId, Boolean active) {
        User currentUser = securityUtils.getCurrentUser();

        // Auto-filter lecturers to own courses when lecturerId not provided
        if (currentUser.getRole() == UserRole.LECTURER && lecturerId == null) {
            lecturerId = currentUser.getId();
        }

        // Students default to active catalog when active not specified
        if (currentUser.getRole() == UserRole.STUDENT && active == null) {
            active = true;
        }

        Pageable pageable = createPageable(page, size, sort);

        Page<Course> coursePage;
        if (departmentId != null) {
            if (active != null) {
                coursePage = courseRepository.findByDepartmentIdAndActive(departmentId, active, pageable);
            } else {
                coursePage = courseRepository.findByDepartmentId(departmentId, pageable);
            }
        } else if (lecturerId != null) {
            if (active != null) {
                coursePage = courseRepository.findByLecturerIdAndActive(lecturerId, active, pageable);
            } else {
                coursePage = courseRepository.findByLecturerId(lecturerId, pageable);
            }
        } else if (active != null) {
            coursePage = courseRepository.findByActive(active, pageable);
        } else {
            coursePage = courseRepository.findAll(pageable);
        }

        return PagedResponse.<CourseResponse>builder()
            .content(coursePage.getContent().stream().map(this::toResponse).toList())
            .page(coursePage.getNumber())
            .size(coursePage.getSize())
            .totalElements(coursePage.getTotalElements())
            .totalPages(coursePage.getTotalPages())
            .isFirst(coursePage.isFirst())
            .isLast(coursePage.isLast())
            .hasContent(coursePage.hasContent())
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

    private CourseResponse toResponse(Course course) {
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
            .lecturerName(course.getLecturer() != null ? course.getLecturer().getFirstName() + " " + course.getLecturer().getLastName() : null)
            .maxCapacity(course.getMaxCapacity())
            .enrolledCount(enrolledCount)
            .active(Boolean.TRUE.equals(course.getActive()))
            .createdAt(course.getCreatedAt().toLocalDateTime())
            .updatedAt(course.getUpdatedAt().toLocalDateTime())
            .build();
    }
}
