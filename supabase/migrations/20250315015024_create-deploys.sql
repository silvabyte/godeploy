-- ================================================
-- create-deploys.sql
-- ================================================
-- Create Deploys table for tracking deploy events
create table public.deploys (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  url text not null, -- final CDN URL e.g., https://my-app.godeploy.app
  status text not null default 'pending', -- pending, success, failed
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_deploys_tenant_id on public.deploys(tenant_id);
create index idx_deploys_project_id on public.deploys(project_id);
create index idx_deploys_user_id on public.deploys(user_id);
