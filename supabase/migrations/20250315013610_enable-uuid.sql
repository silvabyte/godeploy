-- ================================================
-- enable-uuid.sql
-- ================================================
-- Enable UUID extension for UUID primary keys
create extension if not exists "uuid-ossp" with schema extensions;