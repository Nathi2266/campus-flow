package com.campusflow.dto.mapper;

import com.campusflow.domain.Department;
import com.campusflow.domain.Student;
import com.campusflow.domain.User;
import com.campusflow.dto.response.UserResponse;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-03T12:37:40+0000",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponse toResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserResponse.UserResponseBuilder userResponse = UserResponse.builder();

        userResponse.departmentId( userDepartmentId( user ) );
        userResponse.studentId( userStudentId( user ) );
        userResponse.id( user.getId() );
        userResponse.email( user.getEmail() );
        userResponse.firstName( user.getFirstName() );
        userResponse.lastName( user.getLastName() );
        if ( user.getRole() != null ) {
            userResponse.role( user.getRole().name() );
        }
        userResponse.phoneNumber( user.getPhoneNumber() );
        userResponse.preferredTheme( user.getPreferredTheme() );

        return userResponse.build();
    }

    private Long userDepartmentId(User user) {
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

    private Long userStudentId(User user) {
        if ( user == null ) {
            return null;
        }
        Student student = user.getStudent();
        if ( student == null ) {
            return null;
        }
        Long id = student.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
