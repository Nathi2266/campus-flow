-- Fix seed passwords to a real BCrypt hash for Admin123!
-- Also widen tokens.token for full JWT refresh tokens.

UPDATE users
SET password_hash = '$2a$12$4s3sDHusTrBP9gMbINklH.w2HWomoWlPuXANbSPWChDwSHzo1NsP2';

ALTER TABLE tokens
    ALTER COLUMN token TYPE TEXT;
