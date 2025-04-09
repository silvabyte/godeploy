-- ================================================
-- create-projects.sql
-- ================================================
-- Create Projects table
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  subdomain text unique not null, -- e.g., my-app.godeploy.app
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_projects_tenant_id on public.projects(tenant_id);
create index idx_projects_owner_id on public.projects(owner_id);

