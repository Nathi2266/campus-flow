package com.campusflow.dto.mapper;

import com.campusflow.domain.Department;
import com.campusflow.dto.response.DepartmentResponse;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-04T01:38:21+0000",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class DepartmentMapperImpl implements DepartmentMapper {

    @Override
    public DepartmentResponse toResponse(Department department) {
        if ( department == null ) {
            return null;
        }

        DepartmentResponse.DepartmentResponseBuilder departmentResponse = DepartmentResponse.builder();

        departmentResponse.id( department.getId() );
        departmentResponse.name( department.getName() );
        departmentResponse.description( department.getDescription() );
        departmentResponse.createdAt( map( department.getCreatedAt() ) );

        return departmentResponse.build();
    }
}
