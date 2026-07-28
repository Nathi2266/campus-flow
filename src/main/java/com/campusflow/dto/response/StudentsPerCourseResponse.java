package com.campusflow.dto.response;

import lombok.*;

/**
 * Response DTO for students enrolled per course.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentsPerCourseResponse {

    private Long courseId;
    private String courseCode;
    private String courseName;
    private Integer enrolledStudents;
}
