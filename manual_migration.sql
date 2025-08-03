-- Manual migration script to add first_name, last_name, and address fields
-- Run this in your database management tool or command line

-- Add the new columns
ALTER TABLE users ADD COLUMN first_name VARCHAR(255) NULL AFTER name;
ALTER TABLE users ADD COLUMN last_name VARCHAR(255) NULL AFTER first_name;
ALTER TABLE users ADD COLUMN address TEXT NULL AFTER email;

-- Migrate existing user data
UPDATE users 
SET 
    first_name = TRIM(SUBSTRING_INDEX(name, ' ', 1)),
    last_name = CASE 
        WHEN LOCATE(' ', name) > 0 THEN TRIM(SUBSTRING(name, LOCATE(' ', name) + 1))
        ELSE 'User'
    END
WHERE first_name IS NULL OR first_name = '';

-- Verify the changes
SELECT id, name, first_name, last_name, email FROM users LIMIT 10;