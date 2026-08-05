-- OPTIONAL demo seed (only when CAMPUSFLOW_SEED_DEMO=true).
-- Not applied for default clones — users create their own data.
-- Password for all demo users: Admin123!
-- CampusFlow Seed Data - Initial Setup
-- Version: 1.0.0

-- Insert departments
INSERT INTO departments (name, description, created_at, updated_at)
VALUES 
    ('Computer Science', 'Department of Computer Science and Engineering', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Mathematics', 'Department of Mathematics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Physics', 'Department of Physics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Chemistry', 'Department of Chemistry', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Biology', 'Department of Biology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Set sequence to highest ID
SELECT setval('departments_id_seq', (SELECT COALESCE(MAX(id), 0) FROM departments));

-- Insert admin user
-- Password: Admin123! (BCrypt hash)
INSERT INTO users (email, password_hash, first_name, last_name, role, created_at, updated_at)
VALUES (
    'admin@campusflow.edu',
    '$2a$12$4s3sDHusTrBP9gMbINklH.w2HWomoWlPuXANbSPWChDwSHzo1NsP2',
    'System',
    'Admin',
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert lecturer users
INSERT INTO users (email, password_hash, first_name, last_name, role, department_id, created_at, updated_at)
VALUES (
    'lecturer1@campusflow.edu',
    '$2a$12$4s3sDHusTrBP9gMbINklH.w2HWomoWlPuXANbSPWChDwSHzo1NsP2',
    'John',
    'Lecturer',
    'LECTURER',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'lecturer2@campusflow.edu',
    '$2a$12$4s3sDHusTrBP9gMbINklH.w2HWomoWlPuXANbSPWChDwSHzo1NsP2',
    'Jane',
    'Professor',
    'LECTURER',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Set sequence to highest ID
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users));

-- Insert student users
INSERT INTO users (email, password_hash, first_name, last_name, role, department_id, created_at, updated_at)
VALUES (
    'student1@campusflow.edu',
    '$2a$12$4s3sDHusTrBP9gMbINklH.w2HWomoWlPuXANbSPWChDwSHzo1NsP2',
    'John',
    'Student',
    'STUDENT',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'student2@campusflow.edu',
    '$2a$12$4s3sDHusTrBP9gMbINklH.w2HWomoWlPuXANbSPWChDwSHzo1NsP2',
    'Jane',
    'Smith',
    'STUDENT',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'student3@campusflow.edu',
    '$2a$12$4s3sDHusTrBP9gMbINklH.w2HWomoWlPuXANbSPWChDwSHzo1NsP2',
    'Bob',
    'Johnson',
    'STUDENT',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'student4@campusflow.edu',
    '$2a$12$4s3sDHusTrBP9gMbINklH.w2HWomoWlPuXANbSPWChDwSHzo1NsP2',
    'Alice',
    'Williams',
    'STUDENT',
    2,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'student5@campusflow.edu',
    '$2a$12$4s3sDHusTrBP9gMbINklH.w2HWomoWlPuXANbSPWChDwSHzo1NsP2',
    'Charlie',
    'Brown',
    'STUDENT',
    2,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Set sequence to highest ID
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users));

-- Insert students
INSERT INTO students (user_id, student_number, first_name, last_name, enrollment_date, academic_status, created_at, updated_at)
VALUES (
    (SELECT id FROM users WHERE email = 'student1@campusflow.edu'),
    '2024001',
    'John',
    'Student',
    '2024-01-15',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM users WHERE email = 'student2@campusflow.edu'),
    '2024002',
    'Jane',
    'Smith',
    '2024-01-15',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM users WHERE email = 'student3@campusflow.edu'),
    '2024003',
    'Bob',
    'Johnson',
    '2024-01-15',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM users WHERE email = 'student4@campusflow.edu'),
    '2024004',
    'Alice',
    'Williams',
    '2024-01-15',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM users WHERE email = 'student5@campusflow.edu'),
    '2024005',
    'Charlie',
    'Brown',
    '2024-01-15',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Set sequence to highest ID
SELECT setval('students_id_seq', (SELECT COALESCE(MAX(id), 0) FROM students));

-- Insert courses
INSERT INTO courses (code, name, description, credits, department_id, lecturer_id, max_capacity, active, created_at, updated_at)
VALUES (
    'CS101',
    'Introduction to Programming',
    'Introduction to programming fundamentals using Python',
    3,
    1,
    (SELECT id FROM users WHERE email = 'lecturer1@campusflow.edu'),
    30,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'CS201',
    'Data Structures',
    'Intermediate data structures and algorithms',
    4,
    1,
    (SELECT id FROM users WHERE email = 'lecturer2@campusflow.edu'),
    25,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'MATH101',
    'Calculus I',
    'Introduction to differential and integral calculus',
    4,
    2,
    (SELECT id FROM users WHERE email = 'lecturer1@campusflow.edu'),
    35,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'PHYS101',
    'Physics I',
    'Introduction to mechanics and thermodynamics',
    4,
    3,
    (SELECT id FROM users WHERE email = 'lecturer2@campusflow.edu'),
    30,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'CHEM101',
    'Chemistry I',
    'Introduction to general chemistry',
    3,
    4,
    (SELECT id FROM users WHERE email = 'lecturer1@campusflow.edu'),
    28,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Set sequence to highest ID
SELECT setval('courses_id_seq', (SELECT COALESCE(MAX(id), 0) FROM courses));

-- Insert enrollments
INSERT INTO enrollments (student_id, course_id, enrollment_date, status, created_at, updated_at)
VALUES (
    (SELECT id FROM students WHERE student_number = '2024001'),
    (SELECT id FROM courses WHERE code = 'CS101'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM students WHERE student_number = '2024001'),
    (SELECT id FROM courses WHERE code = 'MATH101'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM students WHERE student_number = '2024001'),
    (SELECT id FROM courses WHERE code = 'PHYS101'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM students WHERE student_number = '2024002'),
    (SELECT id FROM courses WHERE code = 'CS101'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM students WHERE student_number = '2024002'),
    (SELECT id FROM courses WHERE code = 'CS201'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM students WHERE student_number = '2024003'),
    (SELECT id FROM courses WHERE code = 'MATH101'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM students WHERE student_number = '2024003'),
    (SELECT id FROM courses WHERE code = 'PHYS101'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM students WHERE student_number = '2024004'),
    (SELECT id FROM courses WHERE code = 'CHEM101'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    (SELECT id FROM students WHERE student_number = '2024005'),
    (SELECT id FROM courses WHERE code = 'CS101'),
    CURRENT_TIMESTAMP,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Set sequence to highest ID
SELECT setval('enrollments_id_seq', (SELECT COALESCE(MAX(id), 0) FROM enrollments));

