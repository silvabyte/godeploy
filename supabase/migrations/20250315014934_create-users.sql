-- ================================================
-- create-users.sql
-- ================================================
-- Create Users table, linked to Tenants
create table public.users (
  id uuid primary key, -- Supabase auth.users.id
  email text unique not null,
  tenant_id uuid not null unique references public.tenants(id) on delete cascade,
  created_at timestamp with time zone default now()
);