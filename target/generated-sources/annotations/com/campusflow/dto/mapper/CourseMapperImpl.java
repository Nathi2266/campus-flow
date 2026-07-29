package com.campusflow.dto.mapper;

import com.campusflow.domain.Course;
import com.campusflow.dto.request.CourseCreateRequest;
import com.campusflow.dto.request.CourseUpdateRequest;
import com.campusflow.dto.response.CourseResponse;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-28T15:30:00+0000",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class CourseMapperImpl implements CourseMapper {

    @Override
    public Course toEntity(CourseCreateRequest request) {
        if ( request == null ) {
            return null;
        }

        Course.CourseBuilder course = Course.builder();

        course.code( request.getCode() );
        course.name( request.getName() );
        course.description( request.getDescription() );
        course.credits( request.getCredits() );
        course.maxCapacity( request.getMaxCapacity() );

        return course.build();
    }

    @Override
    public Course toEntity(CourseUpdateRequest request, Course course) {
        if ( request == null ) {
            return course;
        }

        course.setName( request.getName() );
        course.setDescription( request.getDescription() );
        course.setCredits( request.getCredits() );
        course.setMaxCapacity( request.getMaxCapacity() );

        return course;
    }

    @Override
    public CourseResponse toResponse(Course course) {
        if ( course == null ) {
            return null;
        }

        CourseResponse.CourseResponseBuilder courseResponse = CourseResponse.builder();

        courseResponse.id( course.getId() );
        courseResponse.code( course.getCode() );
        courseResponse.name( course.getName() );
        courseResponse.description( course.getDescription() );
        courseResponse.credits( course.getCredits() );
        courseResponse.maxCapacity( course.getMaxCapacity() );
        courseResponse.active( course.getActive() );
        courseResponse.createdAt( map( course.getCreatedAt() ) );
        courseResponse.updatedAt( map( course.getUpdatedAt() ) );

        return courseResponse.build();
    }

    @Override
    public CourseResponse toResponseWithLecturer(Course course) {
        if ( course == null ) {
            return null;
        }

        CourseResponse.CourseResponseBuilder courseResponse = CourseResponse.builder();

        courseResponse.lecturerName( fullName( course.getLecturer() ) );
        courseResponse.id( course.getId() );
        courseResponse.code( course.getCode() );
        courseResponse.name( course.getName() );
        courseResponse.description( course.getDescription() );
        courseResponse.credits( course.getCredits() );
        courseResponse.maxCapacity( course.getMaxCapacity() );
        courseResponse.active( course.getActive() );
        courseResponse.createdAt( map( course.getCreatedAt() ) );
        courseResponse.updatedAt( map( course.getUpdatedAt() ) );

        return courseResponse.build();
    }

    @Override
    public List<CourseResponse> toResponseList(List<Course> courses) {
        if ( courses == null ) {
            return null;
        }

        List<CourseResponse> list = new ArrayList<CourseResponse>( courses.size() );
        for ( Course course : courses ) {
            list.add( toResponse( course ) );
        }

        return list;
    }
}
