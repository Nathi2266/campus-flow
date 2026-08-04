package com.campusflow.dto.mapper;

import com.campusflow.domain.Course;
import com.campusflow.domain.User;
import com.campusflow.dto.request.CourseCreateRequest;
import com.campusflow.dto.request.CourseUpdateRequest;
import com.campusflow.dto.response.CourseResponse;
import org.mapstruct.*;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Mapper for Course entity and DTOs.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CourseMapper {

    Course toEntity(CourseCreateRequest request);

    Course toEntity(CourseUpdateRequest request, @MappingTarget Course course);

    @Named("toResponse")
    CourseResponse toResponse(Course course);

    @Mapping(source = "lecturer", target = "lecturerName", qualifiedByName = "fullName")
    CourseResponse toResponseWithLecturer(Course course);

    @IterableMapping(elementTargetType = CourseResponse.class)
    List<CourseResponse> toResponseList(List<Course> courses);

    @Named("fullName")
    default String fullName(User user) {
        if (user == null) {
            return null;
        }
        return user.getFirstName() + " " + user.getLastName();
    }

    default LocalDateTime map(OffsetDateTime value) {
        return value == null ? null : value.toLocalDateTime();
    }
}
