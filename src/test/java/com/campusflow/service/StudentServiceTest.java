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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StudentService Unit Tests")
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private StudentService studentService;

    private StudentCreateRequest createRequest;
    private StudentUpdateRequest updateRequest;
    private Department department;
    private Student student;
    private User adminUser;
    private User studentUser;

    @BeforeEach
    void setUp() {
        department = Department.builder()
            .id(1L)
            .name("Computer Science")
            .build();

        studentUser = User.builder()
            .id(1L)
            .email("john.student@campusflow.edu")
            .firstName("John")
            .lastName("Student")
            .role(UserRole.STUDENT)
            .department(department)
            .build();

        student = Student.builder()
            .id(1L)
            .user(studentUser)
            .studentNumber("2024001")
            .firstName("John")
            .lastName("Student")
            .enrollmentDate(java.time.LocalDate.now())
            .academicStatus(AcademicStatus.ACTIVE)
            .build();

        adminUser = User.builder()
            .id(99L)
            .email("admin@campusflow.edu")
            .role(UserRole.ADMIN)
            .build();

        createRequest = StudentCreateRequest.builder()
            .email("john.student@campusflow.edu")
            .firstName("John")
            .lastName("Student")
            .departmentId(1L)
            .build();

        updateRequest = StudentUpdateRequest.builder()
            .firstName("John")
            .lastName("Updated")
            .phoneNumber("123-456-7890")
            .academicStatus("ACTIVE")
            .build();
    }

    @Test
    @DisplayName("Should create student with one-time temporary password")
    void testCreateStudent_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(10L);
            return u;
        });
        when(studentRepository.save(any(Student.class))).thenAnswer(inv -> {
            Student s = inv.getArgument(0);
            s.setId(1L);
            return s;
        });

        StudentResponse response = studentService.createStudent(createRequest);

        assertNotNull(response);
        assertEquals("John", response.getFirstName());
        assertNotNull(response.getTemporaryPassword());
        assertTrue(response.getTemporaryPassword().length() >= 12);
        verify(passwordEncoder).encode(response.getTemporaryPassword());
        verify(userRepository).save(any(User.class));
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    @DisplayName("Should throw ValidationException when email already exists")
    void testCreateStudent_EmailAlreadyExists() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        ValidationException exception = assertThrows(
            ValidationException.class,
            () -> studentService.createStudent(createRequest)
        );
        assertEquals("Email already exists", exception.getMessage());
        verify(studentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw NotFoundException when department not found")
    void testCreateStudent_DepartmentNotFound() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(departmentRepository.findById(1L)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(
            NotFoundException.class,
            () -> studentService.createStudent(createRequest)
        );
        assertEquals("Department not found", exception.getMessage());
        verify(studentRepository, never()).save(any());
    }

    @Test
    @DisplayName("ADMIN can get student by ID")
    void testGetStudent_Success() {
        when(securityUtils.getCurrentUser()).thenReturn(adminUser);
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        StudentResponse response = studentService.getStudent(1L);

        assertNotNull(response);
        assertEquals("John", response.getFirstName());
    }

    @Test
    @DisplayName("STUDENT cannot get another student by ID")
    void testGetStudent_StudentForbidden() {
        when(securityUtils.getCurrentUser()).thenReturn(studentUser);
        when(studentRepository.findByUserId(1L)).thenReturn(Optional.of(student));

        ValidationException ex = assertThrows(
            ValidationException.class,
            () -> studentService.getStudent(999L)
        );
        assertEquals("FORBIDDEN", ex.getErrorCode());
        verify(studentRepository, never()).findById(999L);
    }

    @Test
    @DisplayName("STUDENT list returns only own record")
    void testListStudents_StudentScoped() {
        when(securityUtils.getCurrentUser()).thenReturn(studentUser);
        when(studentRepository.findByUserId(1L)).thenReturn(Optional.of(student));

        PagedResponse<StudentResponse> response = studentService.listStudents(0, 20, null, null, null);

        assertEquals(1, response.getContent().size());
        assertEquals(1L, response.getContent().get(0).getId());
        verify(studentRepository, never()).findAll(any(Pageable.class));
    }

    @Test
    @DisplayName("Should throw NotFoundException when student not found")
    void testGetStudent_NotFound() {
        when(securityUtils.getCurrentUser()).thenReturn(adminUser);
        when(studentRepository.findById(1L)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(
            NotFoundException.class,
            () -> studentService.getStudent(1L)
        );
        assertEquals("Student not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should update student successfully")
    void testUpdateStudent_Success() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        StudentResponse response = studentService.updateStudent(1L, updateRequest);

        assertNotNull(response);
        assertEquals("Updated", response.getLastName());
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    @DisplayName("Should soft delete student")
    void testDeleteStudent_Success() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        studentService.deleteStudent(1L);

        verify(studentRepository).save(any(Student.class));
        assertEquals(AcademicStatus.INACTIVE, student.getAcademicStatus());
    }

    @Test
    @DisplayName("ADMIN list students with pagination")
    void testListStudents_Success() {
        when(securityUtils.getCurrentUser()).thenReturn(adminUser);
        when(studentRepository.findAll(any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(student), PageRequest.of(0, 20), 1));

        PagedResponse<StudentResponse> response = studentService.listStudents(0, 20, null, null, null);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        verify(studentRepository).findAll(any(Pageable.class));
    }
}
