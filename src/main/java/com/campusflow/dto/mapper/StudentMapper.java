package com.campusflow.dto.mapper;

import com.campusflow.domain.Student;
import com.campusflow.dto.request.StudentCreateRequest;
import com.campusflow.dto.request.StudentUpdateRequest;
import com.campusflow.dto.response.StudentResponse;
import org.mapstruct.*;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Mapper for Student entity and DTOs.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface StudentMapper {

    Student toEntity(StudentCreateRequest request);

    Student toEntity(StudentUpdateRequest request, @MappingTarget Student student);

    @Named("toResponse")
    StudentResponse toResponse(Student student);

    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.phoneNumber", target = "phoneNumber")
    @Mapping(source = "user.department.id", target = "departmentId")
    @Mapping(source = "user.department.name", target = "departmentName")
    StudentResponse toResponseWithUserAndDepartment(Student student);

    @IterableMapping(elementTargetType = StudentResponse.class)
    List<StudentResponse> toResponseList(List<Student> students);

    default LocalDateTime map(OffsetDateTime value) {
        return value == null ? null : value.toLocalDateTime();
    }
}
