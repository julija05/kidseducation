-- Add language preference columns to users table
USE laravel;

ALTER TABLE users 
ADD COLUMN language_preference VARCHAR(5) NULL DEFAULT NULL AFTER email_verified_at,
ADD COLUMN language_selected BOOLEAN DEFAULT FALSE AFTER language_preference;

-- Verify the columns were added
DESCRIBE users;