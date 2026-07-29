package com.campusflow.service;

import com.campusflow.domain.Department;
import com.campusflow.dto.mapper.DepartmentMapper;
import com.campusflow.dto.request.DepartmentCreateRequest;
import com.campusflow.dto.request.DepartmentUpdateRequest;
import com.campusflow.dto.response.DepartmentResponse;
import com.campusflow.exception.NotFoundException;
import com.campusflow.exception.ValidationException;
import com.campusflow.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for department management.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;

    @Transactional(readOnly = true)
    public List<DepartmentResponse> listDepartments() {
        return departmentRepository.findAll().stream()
            .map(departmentMapper::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getDepartment(Long id) {
        return departmentMapper.toResponse(findDepartment(id));
    }

    public DepartmentResponse createDepartment(DepartmentCreateRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new ValidationException("Department name already exists", "name", "DEPARTMENT_EXISTS");
        }

        Department department = Department.builder()
            .name(request.getName())
            .description(request.getDescription())
            .build();

        return departmentMapper.toResponse(departmentRepository.save(department));
    }

    public DepartmentResponse updateDepartment(Long id, DepartmentUpdateRequest request) {
        Department department = findDepartment(id);

        if (!department.getName().equals(request.getName())
            && departmentRepository.existsByName(request.getName())) {
            throw new ValidationException("Department name already exists", "name", "DEPARTMENT_EXISTS");
        }

        department.setName(request.getName());
        department.setDescription(request.getDescription());
        return departmentMapper.toResponse(departmentRepository.save(department));
    }

    public void deleteDepartment(Long id) {
        Department department = findDepartment(id);
        departmentRepository.delete(department);
    }

    private Department findDepartment(Long id) {
        return departmentRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Department not found", "id"));
    }
}
