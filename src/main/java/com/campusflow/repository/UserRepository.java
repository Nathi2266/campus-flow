package com.campusflow.repository;

import com.campusflow.domain.User;
import com.campusflow.domain.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT u FROM User u WHERE " +
        "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<User> searchAll(@Param("search") String search, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.role = :role AND (" +
        "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchByRole(@Param("search") String search, @Param("role") UserRole role, Pageable pageable);
}
