-- ================================================
-- 009-add-project-description.sql
-- ================================================
-- Add optional description field to projects table

alter table public.projects
add column if not exists description text;
