package com.campusflow.repository;

import com.campusflow.domain.User;
import com.campusflow.domain.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for User entity.
 *
 * @author CampusFlow Team
 * @version 1.0.0
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    Optional<User> findByIdAndRole(Long id, UserRole role);

    Page<User> findByDepartmentId(Long departmentId, Pageable pageable);

    Page<User> findByRole(UserRole role, Pageable pageable);

    Page<User> findByDepartmentIdAndRole(Long departmentId, UserRole role, Pageable pageable);
}
