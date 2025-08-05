-- Add language field to lesson_resources table
-- Run this SQL in your database management tool or via command line

-- Add the language column with default value 'en'
ALTER TABLE lesson_resources 
ADD COLUMN language VARCHAR(5) NOT NULL DEFAULT 'en' 
AFTER type;

-- Add index for efficient querying by language
CREATE INDEX idx_lesson_resources_lesson_id_language 
ON lesson_resources(lesson_id, language);

-- Update existing resources to have English as default language
UPDATE lesson_resources 
SET language = 'en' 
WHERE language IS NULL OR language = '';

-- Show the updated table structure
DESCRIBE lesson_resources;