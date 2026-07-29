package com.campusflow.dto.mapper;

import com.campusflow.domain.Course;
import com.campusflow.domain.Enrollment;
import com.campusflow.domain.Student;
import com.campusflow.dto.request.EnrollmentCreateRequest;
import com.campusflow.dto.response.EnrollmentResponse;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-28T15:29:59+0000",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class EnrollmentMapperImpl implements EnrollmentMapper {

    @Override
    public Enrollment toEntity(EnrollmentCreateRequest request) {
        if ( request == null ) {
            return null;
        }

        Enrollment.EnrollmentBuilder enrollment = Enrollment.builder();

        return enrollment.build();
    }

    @Override
    public EnrollmentResponse toResponse(Enrollment enrollment) {
        if ( enrollment == null ) {
            return null;
        }

        EnrollmentResponse.EnrollmentResponseBuilder enrollmentResponse = EnrollmentResponse.builder();

        enrollmentResponse.id( enrollment.getId() );
        enrollmentResponse.enrollmentDate( map( enrollment.getEnrollmentDate() ) );
        enrollmentResponse.status( enrollment.getStatus() );
        enrollmentResponse.grade( enrollment.getGrade() );
        enrollmentResponse.notes( enrollment.getNotes() );
        enrollmentResponse.createdAt( map( enrollment.getCreatedAt() ) );
        enrollmentResponse.updatedAt( map( enrollment.getUpdatedAt() ) );

        return enrollmentResponse.build();
    }

    @Override
    public EnrollmentResponse toResponseWithDetails(Enrollment enrollment) {
        if ( enrollment == null ) {
            return null;
        }

        EnrollmentResponse.EnrollmentResponseBuilder enrollmentResponse = EnrollmentResponse.builder();

        enrollmentResponse.studentName( enrollmentStudentFirstName( enrollment ) );
        enrollmentResponse.courseCode( enrollmentCourseCode( enrollment ) );
        enrollmentResponse.courseName( enrollmentCourseName( enrollment ) );
        enrollmentResponse.id( enrollment.getId() );
        enrollmentResponse.enrollmentDate( map( enrollment.getEnrollmentDate() ) );
        enrollmentResponse.status( enrollment.getStatus() );
        enrollmentResponse.grade( enrollment.getGrade() );
        enrollmentResponse.notes( enrollment.getNotes() );
        enrollmentResponse.createdAt( map( enrollment.getCreatedAt() ) );
        enrollmentResponse.updatedAt( map( enrollment.getUpdatedAt() ) );

        return enrollmentResponse.build();
    }

    @Override
    public List<EnrollmentResponse> toResponseList(List<Enrollment> enrollments) {
        if ( enrollments == null ) {
            return null;
        }

        List<EnrollmentResponse> list = new ArrayList<EnrollmentResponse>( enrollments.size() );
        for ( Enrollment enrollment : enrollments ) {
            list.add( toResponse( enrollment ) );
        }

        return list;
    }

    private String enrollmentStudentFirstName(Enrollment enrollment) {
        if ( enrollment == null ) {
            return null;
        }
        Student student = enrollment.getStudent();
        if ( student == null ) {
            return null;
        }
        String firstName = student.getFirstName();
        if ( firstName == null ) {
            return null;
        }
        return firstName;
    }

    private String enrollmentCourseCode(Enrollment enrollment) {
        if ( enrollment == null ) {
            return null;
        }
        Course course = enrollment.getCourse();
        if ( course == null ) {
            return null;
        }
        String code = course.getCode();
        if ( code == null ) {
            return null;
        }
        return code;
    }

    private String enrollmentCourseName(Enrollment enrollment) {
        if ( enrollment == null ) {
            return null;
        }
        Course course = enrollment.getCourse();
        if ( course == null ) {
            return null;
        }
        String name = course.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
