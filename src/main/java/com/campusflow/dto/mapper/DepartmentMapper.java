package com.campusflow.dto.mapper;

import com.campusflow.domain.Department;
import com.campusflow.dto.response.DepartmentResponse;
import org.mapstruct.Mapper;

/**
 * Mapper for Department entity and DTOs.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Mapper(componentModel = "spring")
public interface DepartmentMapper {

    DepartmentResponse toResponse(Department department);
}
