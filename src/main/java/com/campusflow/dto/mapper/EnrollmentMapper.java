package com.campusflow.dto.mapper;

import com.campusflow.domain.Enrollment;
import com.campusflow.dto.request.EnrollmentCreateRequest;
import com.campusflow.dto.response.EnrollmentResponse;
import org.mapstruct.*;

/**
 * Mapper for Enrollment entity and DTOs.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface EnrollmentMapper {

    Enrollment toEntity(EnrollmentCreateRequest request);

    EnrollmentResponse toResponse(Enrollment enrollment);

    @Mapping(source = "student.firstName", target = "studentName")
    @Mapping(source = "course.code", target = "courseCode")
    @Mapping(source = "course.name", target = "courseName")
    EnrollmentResponse toResponseWithDetails(Enrollment enrollment);

    @IterableMapping(componentModel = MappingConstants.ComponentModel.SPRING)
    java.util.List<EnrollmentResponse> toResponseList(java.util.List<Enrollment> enrollments);
}
