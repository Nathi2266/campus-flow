package com.campusflow.dto.mapper;

import com.campusflow.domain.Department;
import com.campusflow.domain.Student;
import com.campusflow.domain.User;
import com.campusflow.domain.enums.AcademicStatus;
import com.campusflow.dto.request.StudentCreateRequest;
import com.campusflow.dto.request.StudentUpdateRequest;
import com.campusflow.dto.response.StudentResponse;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-29T22:10:05+0000",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class StudentMapperImpl implements StudentMapper {

    @Override
    public Student toEntity(StudentCreateRequest request) {
        if ( request == null ) {
            return null;
        }

        Student.StudentBuilder student = Student.builder();

        student.firstName( request.getFirstName() );
        student.lastName( request.getLastName() );

        return student.build();
    }

    @Override
    public Student toEntity(StudentUpdateRequest request, Student student) {
        if ( request == null ) {
            return student;
        }

        student.setFirstName( request.getFirstName() );
        student.setLastName( request.getLastName() );
        if ( request.getAcademicStatus() != null ) {
            student.setAcademicStatus( Enum.valueOf( AcademicStatus.class, request.getAcademicStatus() ) );
        }
        else {
            student.setAcademicStatus( null );
        }

        return student;
    }

    @Override
    public StudentResponse toResponse(Student student) {
        if ( student == null ) {
            return null;
        }

        StudentResponse.StudentResponseBuilder studentResponse = StudentResponse.builder();

        studentResponse.id( student.getId() );
        studentResponse.studentNumber( student.getStudentNumber() );
        studentResponse.firstName( student.getFirstName() );
        studentResponse.lastName( student.getLastName() );
        studentResponse.enrollmentDate( student.getEnrollmentDate() );
        studentResponse.academicStatus( student.getAcademicStatus() );
        studentResponse.gpa( student.getGpa() );
        studentResponse.graduationDate( student.getGraduationDate() );
        studentResponse.createdAt( map( student.getCreatedAt() ) );
        studentResponse.updatedAt( map( student.getUpdatedAt() ) );

        return studentResponse.build();
    }

    @Override
    public StudentResponse toResponseWithUserAndDepartment(Student student) {
        if ( student == null ) {
            return null;
        }

        StudentResponse.StudentResponseBuilder studentResponse = StudentResponse.builder();

        studentResponse.email( studentUserEmail( student ) );
        studentResponse.phoneNumber( studentUserPhoneNumber( student ) );
        studentResponse.departmentId( studentUserDepartmentId( student ) );
        studentResponse.departmentName( studentUserDepartmentName( student ) );
        studentResponse.id( student.getId() );
        studentResponse.studentNumber( student.getStudentNumber() );
        studentResponse.firstName( student.getFirstName() );
        studentResponse.lastName( student.getLastName() );
        studentResponse.enrollmentDate( student.getEnrollmentDate() );
        studentResponse.academicStatus( student.getAcademicStatus() );
        studentResponse.gpa( student.getGpa() );
        studentResponse.graduationDate( student.getGraduationDate() );
        studentResponse.createdAt( map( student.getCreatedAt() ) );
        studentResponse.updatedAt( map( student.getUpdatedAt() ) );

        return studentResponse.build();
    }

    @Override
    public List<StudentResponse> toResponseList(List<Student> students) {
        if ( students == null ) {
            return null;
        }

        List<StudentResponse> list = new ArrayList<StudentResponse>( students.size() );
        for ( Student student : students ) {
            list.add( toResponse( student ) );
        }

        return list;
    }

    private String studentUserEmail(Student student) {
        if ( student == null ) {
            return null;
        }
        User user = student.getUser();
        if ( user == null ) {
            return null;
        }
        String email = user.getEmail();
        if ( email == null ) {
            return null;
        }
        return email;
    }

    private String studentUserPhoneNumber(Student student) {
        if ( student == null ) {
            return null;
        }
        User user = student.getUser();
        if ( user == null ) {
            return null;
        }
        String phoneNumber = user.getPhoneNumber();
        if ( phoneNumber == null ) {
            return null;
        }
        return phoneNumber;
    }

    private Long studentUserDepartmentId(Student student) {
        if ( student == null ) {
            return null;
        }
        User user = student.getUser();
        if ( user == null ) {
            return null;
        }
        Department department = user.getDepartment();
        if ( department == null ) {
            return null;
        }
        Long id = department.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String studentUserDepartmentName(Student student) {
        if ( student == null ) {
            return null;
        }
        User user = student.getUser();
        if ( user == null ) {
            return null;
        }
        Department department = user.getDepartment();
        if ( department == null ) {
            return null;
        }
        String name = department.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
