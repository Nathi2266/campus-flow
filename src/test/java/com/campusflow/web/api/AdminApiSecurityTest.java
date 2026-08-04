package com.campusflow.web.api;

import com.campusflow.dto.response.PagedResponse;
import com.campusflow.dto.response.UserResponse;
import com.campusflow.service.UserAdminService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * ADMIN-only API authorization matrix (method security + full security filter chain).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("ADMIN API security")
class AdminApiSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserAdminService userAdminService;

    @Test
    @WithAnonymousUser
    @DisplayName("Unauthenticated users cannot list users")
    void usersList_unauthenticated_unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/users")).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "LECTURER")
    @DisplayName("LECTURER cannot list users")
    void usersList_lecturer_forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/users")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    @DisplayName("STUDENT cannot search users")
    void usersSearch_student_forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/users/search").param("search", "a"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("ADMIN can list users")
    void usersList_admin_ok() throws Exception {
        when(userAdminService.listUsers(any(), any(), any())).thenReturn(
            PagedResponse.<UserResponse>builder()
                .content(List.of())
                .page(0)
                .size(20)
                .totalElements(0L)
                .totalPages(0)
                .isFirst(true)
                .isLast(true)
                .hasContent(false)
                .build()
        );
        mockMvc.perform(get("/api/v1/users")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("ADMIN can deactivate users")
    void usersDeactivate_admin_ok() throws Exception {
        when(userAdminService.deactivateUser(5L)).thenReturn(
            UserResponse.builder().id(5L).email("x@campus.edu").role("LECTURER").active(false).build()
        );
        mockMvc.perform(post("/api/v1/users/5/deactivate")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "LECTURER")
    @DisplayName("LECTURER cannot deactivate users")
    void usersDeactivate_lecturer_forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/users/5/deactivate")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("ADMIN can list departments")
    void departmentsList_admin_ok() throws Exception {
        mockMvc.perform(get("/api/v1/departments")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "LECTURER")
    @DisplayName("LECTURER cannot list departments")
    void departmentsList_lecturer_forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/departments")).andExpect(status().isForbidden());
    }
}
