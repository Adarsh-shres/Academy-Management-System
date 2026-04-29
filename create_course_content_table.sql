-- Add week_number and material_type columns to course_content table
-- Run this SQL in Supabase SQL Editor

ALTER TABLE course_content ADD COLUMN IF NOT EXISTS week_number INT;
ALTER TABLE course_content ADD COLUMN IF NOT EXISTS material_type TEXT;
