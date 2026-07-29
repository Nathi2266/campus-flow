-- Fix seed passwords to a real BCrypt hash for Admin123!
-- Constrained to seed emails only (do not reset passwords for users created after seed).
-- Also widen tokens.token for full JWT refresh tokens.

UPDATE users
SET password_hash = '$2a$12$4s3sDHusTrBP9gMbINklH.w2HWomoWlPuXANbSPWChDwSHzo1NsP2'
WHERE email IN (
    'admin@campusflow.edu',
    'lecturer1@campusflow.edu',
    'lecturer2@campusflow.edu',
    'student1@campusflow.edu',
    'student2@campusflow.edu',
    'student3@campusflow.edu',
    'student4@campusflow.edu',
    'student5@campusflow.edu'
);

ALTER TABLE tokens
    ALTER COLUMN token TYPE TEXT;
