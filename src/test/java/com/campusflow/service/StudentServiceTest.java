package com.campusflow.service;

import com.campusflow.domain.Department;
import com.campusflow.domain.Student;
import com.campusflow.domain.User;
import com.campusflow.domain.enums.AcademicStatus;
import com.campusflow.dto.request.StudentCreateRequest;
import com.campusflow.dto.request.StudentUpdateRequest;
import com.campusflow.dto.response.StudentResponse;
import com.campusflow.exception.NotFoundException;
import com.campusflow.exception.ValidationException;
import com.campusflow.repository.DepartmentRepository;
import com.campusflow.repository.StudentRepository;
import com.campusflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for StudentService.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("StudentService Unit Tests")
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private StudentService studentService;

    private StudentCreateRequest createRequest;
    private StudentUpdateRequest updateRequest;
    private Department department;
    private Student student;

    @BeforeEach
    void setUp() {
        department = Department.builder()
            .id(1L)
            .name("Computer Science")
            .build();

        student = Student.builder()
            .id(1L)
            .user(User.builder()
                .id(1L)
                .email("john.student@campusflow.edu")
                .firstName("John")
                .lastName("Student")
                .build())
            .studentNumber("2024001")
            .firstName("John")
            .lastName("Student")
            .enrollmentDate(java.time.LocalDate.now())
            .academicStatus(AcademicStatus.ACTIVE)
            .department(department)
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
    @DisplayName("Should create student successfully")
    void testCreateStudent_Success() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        // When
        StudentResponse response = studentService.createStudent(createRequest);

        // Then
        assertNotNull(response);
        assertEquals("John", response.getFirstName());
        assertEquals("Student", response.getLastName());
        verify(userRepository).existsByEmail(anyString());
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    @DisplayName("Should throw ValidationException when email already exists")
    void testCreateStudent_EmailAlreadyExists() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // When & Then
        ValidationException exception = assertThrows(
            ValidationException.class,
            () -> studentService.createStudent(createRequest)
        );
        assertEquals("Email already exists", exception.getMessage());
        verify(userRepository).existsByEmail(anyString());
        verify(studentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw NotFoundException when department not found")
    void testCreateStudent_DepartmentNotFound() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(departmentRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        NotFoundException exception = assertThrows(
            NotFoundException.class,
            () -> studentService.createStudent(createRequest)
        );
        assertEquals("Department not found", exception.getMessage());
        verify(departmentRepository).findById(1L);
        verify(studentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should get student by ID")
    void testGetStudent_Success() {
        // Given
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        // When
        StudentResponse response = studentService.getStudent(1L);

        // Then
        assertNotNull(response);
        assertEquals("John", response.getFirstName());
        verify(studentRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw NotFoundException when student not found")
    void testGetStudent_NotFound() {
        // Given
        when(studentRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        NotFoundException exception = assertThrows(
            NotFoundException.class,
            () -> studentService.getStudent(1L)
        );
        assertEquals("Student not found", exception.getMessage());
        verify(studentRepository).findById(1L);
    }

    @Test
    @DisplayName("Should update student successfully")
    void testUpdateStudent_Success() {
        // Given
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        // When
        StudentResponse response = studentService.updateStudent(1L, updateRequest);

        // Then
        assertNotNull(response);
        assertEquals("Updated", response.getLastName());
        verify(studentRepository).findById(1L);
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    @DisplayName("Should soft delete student")
    void testDeleteStudent_Success() {
        // Given
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        // When
        studentService.deleteStudent(1L);

        // Then
        verify(studentRepository).findById(1L);
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    @DisplayName("Should list students with pagination")
    void testListStudents_Success() {
        // Given
        java.util.List<Student> students = java.util.List.of(student);
        org.springframework.data.domain.Page<Student> page = new org.springframework.data.domain.PageImpl<>(
            students,
            org.springframework.data.domain.PageRequest.of(0, 20),
            students.size()
        );

        when(studentRepository.findAll(any(org.springframework.data.domain.Pageable.class)))
            .thenReturn(page);

        // When
        com.campusflow.dto.response.PagedResponse<StudentResponse> response =
            studentService.listStudents(0, 20, null, null, null);

        // Then
        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        verify(studentRepository).findAll(any(org.springframework.data.domain.Pageable.class));
    }
}
