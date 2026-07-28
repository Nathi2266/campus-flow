package com.campusflow.service;

import com.campusflow.domain.Department;
import com.campusflow.domain.Student;
import com.campusflow.domain.User;
import com.campusflow.domain.enums.AcademicStatus;
import com.campusflow.dto.request.StudentCreateRequest;
import com.campusflow.dto.request.StudentUpdateRequest;
import com.campusflow.dto.response.StudentResponse;
import com.campusflow.dto.response.PagedResponse;
import com.campusflow.exception.NotFoundException;
import com.campusflow.exception.ValidationException;
import com.campusflow.repository.DepartmentRepository;
import com.campusflow.repository.StudentRepository;
import com.campusflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public StudentResponse createStudent(StudentCreateRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already exists", "email", "EMAIL_EXISTS");
        }

        // Create user
        User user = User.builder()
            .email(request.getEmail())
            .passwordHash("$2a$12$placeholder") // Will be hashed by AuthService
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .phoneNumber(request.getPhoneNumber())
            .role(com.campusflow.domain.enums.UserRole.STUDENT)
            .build();

        // Create student
        Student student = Student.builder()
            .user(user)
            .studentNumber(generateStudentNumber())
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .enrollmentDate(java.time.LocalDate.now())
            .academicStatus(AcademicStatus.ACTIVE)
            .build();

        user.setStudent(student);

        // Set department
        Department department = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new NotFoundException("Department not found", "departmentId"));
        user.setDepartment(department);

        Student savedStudent = studentRepository.save(student);

        return toResponse(savedStudent);
    }

    public StudentResponse getStudent(Long id) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Student not found", "id"));

        return toResponse(student);
    }

    public StudentResponse updateStudent(Long id, StudentUpdateRequest request) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Student not found", "id"));

        // Update fields
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

        Student updatedStudent = studentRepository.save(student);

        return toResponse(updatedStudent);
    }

    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Student not found", "id"));

        // Soft delete by setting to INACTIVE
        student.setAcademicStatus(AcademicStatus.INACTIVE);
        studentRepository.save(student);
    }

    public PagedResponse<StudentResponse> listStudents(Integer page, Integer size, String sort, Long departmentId, AcademicStatus status) {
        Pageable pageable = createPageable(page, size, sort);

        Page<Student> studentPage;
        if (departmentId != null) {
            if (status != null) {
                studentPage = studentRepository.findByUserDepartmentIdAndAcademicStatus(departmentId, status, pageable);
            } else {
                studentPage = studentRepository.findByUserDepartmentId(departmentId, pageable);
            }
        } else if (status != null) {
            studentPage = studentRepository.findByAcademicStatus(status, pageable);
        } else {
            studentPage = studentRepository.findAll(pageable);
        }

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

    public PagedResponse<StudentResponse> searchStudents(String search, Integer page, Integer size, Long departmentId) {
        Pageable pageable = createPageable(page, size, null);

        Page<Student> studentPage;
        if (departmentId != null) {
            studentPage = studentRepository.searchByDepartment(departmentId, search, pageable);
        } else {
            // Fallback to basic search if search method not available
            studentPage = studentRepository.findAll(pageable);
        }

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
        return "2024" + (int) (Math.random() * 10000);
    }
}
