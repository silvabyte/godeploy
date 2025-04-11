-- ================================================
-- add_project_domain.sql
-- ================================================
-- Add domain column to projects table
ALTER TABLE projects ADD COLUMN domain TEXT NULL;
