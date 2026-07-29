package com.campusflow.service;

import com.campusflow.domain.Department;
import com.campusflow.domain.Student;
import com.campusflow.domain.User;
import com.campusflow.domain.enums.AcademicStatus;
import com.campusflow.domain.enums.UserRole;
import com.campusflow.dto.request.StudentCreateRequest;
import com.campusflow.dto.request.StudentUpdateRequest;
import com.campusflow.dto.response.PagedResponse;
import com.campusflow.dto.response.StudentResponse;
import com.campusflow.exception.NotFoundException;
import com.campusflow.exception.ValidationException;
import com.campusflow.repository.DepartmentRepository;
import com.campusflow.repository.StudentRepository;
import com.campusflow.repository.UserRepository;
import com.campusflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

/**
 * Service class for Student management.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Transactional
public class StudentService {

    private static final String TEMP_PASSWORD_CHARS =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils;

    public StudentResponse createStudent(StudentCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already exists", "email", "EMAIL_EXISTS");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new NotFoundException("Department not found", "departmentId"));

        String temporaryPassword = generateTemporaryPassword();

        User user = User.builder()
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(temporaryPassword))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .phoneNumber(request.getPhoneNumber())
            .role(UserRole.STUDENT)
            .department(department)
            .build();
        user = userRepository.save(user);

        Student student = Student.builder()
            .user(user)
            .studentNumber(generateStudentNumber())
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .enrollmentDate(java.time.LocalDate.now())
            .academicStatus(AcademicStatus.ACTIVE)
            .build();

        user.setStudent(student);
        Student savedStudent = studentRepository.save(student);

        StudentResponse response = toResponse(savedStudent);
        response.setTemporaryPassword(temporaryPassword);
        return response;
    }

    @Transactional(readOnly = true)
    public StudentResponse getStudent(Long id) {
        assertCanAccessStudent(id);
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Student not found", "id"));
        return toResponse(student);
    }

    public StudentResponse updateStudent(Long id, StudentUpdateRequest request) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Student not found", "id"));

        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        if (student.getUser() != null) {
            student.getUser().setPhoneNumber(request.getPhoneNumber());
            student.getUser().setFirstName(request.getFirstName());
            student.getUser().setLastName(request.getLastName());
        }

        if (request.getAcademicStatus() != null) {
            student.setAcademicStatus(AcademicStatus.valueOf(request.getAcademicStatus()));
        }

        return toResponse(studentRepository.save(student));
    }

    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Student not found", "id"));

        student.setAcademicStatus(AcademicStatus.INACTIVE);
        studentRepository.save(student);
    }

    @Transactional(readOnly = true)
    public PagedResponse<StudentResponse> listStudents(
        Integer page, Integer size, String sort, Long departmentId, AcademicStatus status
    ) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == UserRole.STUDENT) {
            return ownStudentPage(currentUser, page, size);
        }

        Pageable pageable = createPageable(page, size, sort);

        Page<Student> studentPage;
        if (departmentId != null) {
            if (status != null) {
                studentPage = studentRepository.findByUserDepartmentIdAndAcademicStatus(
                    departmentId, status, pageable);
            } else {
                studentPage = studentRepository.findByUserDepartmentId(departmentId, pageable);
            }
        } else if (status != null) {
            studentPage = studentRepository.findByAcademicStatus(status, pageable);
        } else {
            studentPage = studentRepository.findAll(pageable);
        }

        return toPagedResponse(studentPage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<StudentResponse> searchStudents(
        String search, Integer page, Integer size, Long departmentId
    ) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == UserRole.STUDENT) {
            return ownStudentPage(currentUser, page, size);
        }

        Pageable pageable = createPageable(page, size, null);
        String query = search != null ? search.trim() : "";

        Page<Student> studentPage;
        if (departmentId != null) {
            studentPage = studentRepository.searchByDepartment(departmentId, query, pageable);
        } else {
            studentPage = studentRepository.searchAll(query, pageable);
        }

        return toPagedResponse(studentPage);
    }

    private PagedResponse<StudentResponse> ownStudentPage(User currentUser, Integer page, Integer size) {
        Student own = requireLinkedStudent(currentUser);
        Pageable pageable = createPageable(page, size, null);
        Page<Student> studentPage = new PageImpl<>(List.of(own), pageable, 1);
        return toPagedResponse(studentPage);
    }

    private void assertCanAccessStudent(Long studentId) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() != UserRole.STUDENT) {
            return;
        }
        Student own = requireLinkedStudent(currentUser);
        if (!own.getId().equals(studentId)) {
            throw new ValidationException("Cannot view another student", "id", "FORBIDDEN");
        }
    }

    private Student requireLinkedStudent(User user) {
        return studentRepository.findByUserId(user.getId())
            .orElseThrow(() -> new ValidationException(
                "No student record linked to user", "student", "STUDENT_NOT_LINKED"));
    }

    private Pageable createPageable(Integer page, Integer size, String sort) {
        int pageNum = page != null ? Math.max(page, 0) : 0;
        int pageSize = size != null ? Math.min(Math.max(size, 1), 100) : 20;
        if (sort != null && !sort.isEmpty()) {
            String[] sortParts = sort.split(",");
            Sort.Direction direction = sortParts.length > 1 && "desc".equalsIgnoreCase(sortParts[1])
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
            return PageRequest.of(pageNum, pageSize, Sort.by(direction, sortParts[0]));
        }
        return PageRequest.of(pageNum, pageSize);
    }

    private PagedResponse<StudentResponse> toPagedResponse(Page<Student> studentPage) {
        return PagedResponse.<StudentResponse>builder()
            .content(studentPage.getContent().stream().map(this::toResponse).toList())
            .page(studentPage.getNumber())
            .size(studentPage.getSize())
            .totalElements(studentPage.getTotalElements())
            .totalPages(studentPage.getTotalPages())
            .isFirst(studentPage.isFirst())
            .isLast(studentPage.isLast())
            .hasContent(studentPage.hasContent())
            .build();
    }

    private StudentResponse toResponse(Student student) {
        User user = student.getUser();
        return StudentResponse.builder()
            .id(student.getId())
            .userId(user != null ? user.getId() : null)
            .studentNumber(student.getStudentNumber())
            .firstName(student.getFirstName())
            .lastName(student.getLastName())
            .email(user != null ? user.getEmail() : null)
            .phoneNumber(user != null ? user.getPhoneNumber() : null)
            .departmentId(user != null && user.getDepartment() != null ? user.getDepartment().getId() : null)
            .departmentName(user != null && user.getDepartment() != null ? user.getDepartment().getName() : null)
            .enrollmentDate(student.getEnrollmentDate())
            .academicStatus(student.getAcademicStatus())
            .gpa(student.getGpa())
            .graduationDate(student.getGraduationDate())
            .createdAt(student.getCreatedAt() != null ? student.getCreatedAt().toLocalDateTime() : null)
            .updatedAt(student.getUpdatedAt() != null ? student.getUpdatedAt().toLocalDateTime() : null)
            .build();
    }

    private String generateStudentNumber() {
        return "2024" + (1000 + SECURE_RANDOM.nextInt(9000));
    }

    private String generateTemporaryPassword() {
        StringBuilder sb = new StringBuilder(14);
        for (int i = 0; i < 14; i++) {
            sb.append(TEMP_PASSWORD_CHARS.charAt(SECURE_RANDOM.nextInt(TEMP_PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }
}
