package com.campusflow.dto.mapper;

import com.campusflow.domain.Department;
import com.campusflow.dto.response.DepartmentResponse;
import org.mapstruct.Mapper;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

/**
 * Mapper for Department entity and DTOs.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Mapper(componentModel = "spring")
public interface DepartmentMapper {

    DepartmentResponse toResponse(Department department);

    default LocalDateTime map(OffsetDateTime value) {
        return value == null ? null : value.toLocalDateTime();
    }
}
