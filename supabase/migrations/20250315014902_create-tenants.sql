-- ================================================
-- create-tenants.sql
-- ================================================
-- Create Tenants table
create table public.tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default now()
);