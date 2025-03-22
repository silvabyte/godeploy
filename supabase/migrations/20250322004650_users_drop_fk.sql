-- Drop foreign key constraint from users table
ALTER TABLE public.users
DROP CONSTRAINT users_tenant_id_fkey;
