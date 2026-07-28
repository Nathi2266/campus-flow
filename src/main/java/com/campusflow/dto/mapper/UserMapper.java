package com.campusflow.dto.mapper;

import com.campusflow.domain.User;
import com.campusflow.dto.response.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper for User entity and DTOs.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = "department.id", target = "departmentId")
    UserResponse toResponse(User user);
}
