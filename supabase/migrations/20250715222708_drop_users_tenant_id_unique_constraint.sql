-- ================================================
-- Drop unique constraint on users.tenant_id
-- ================================================
-- The unique constraint prevents multiple users from having the same tenant_id
-- but we now use tenant_users junction table for many-to-many relationships

alter table public.users drop constraint users_tenant_id_key;