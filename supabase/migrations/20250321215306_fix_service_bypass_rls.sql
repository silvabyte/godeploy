-- ================================================
-- 012-fix-service-bypass-rls.sql
-- ================================================

-- For tenants
alter table public.tenants
enable row level security;

drop policy if exists "Service role can manage all tenants" on public.tenants;

create policy "Service role can manage all tenants"
on public.tenants
for all
to service_role
using (
    true
);


-- For users
alter table public.users
enable row level security;

drop policy if exists "Service role can manage all users" on public.users;

create policy "Service role can manage all users"
on public.users
for all
to service_role
using (
    true
);


-- For projects
alter table public.projects
enable row level security;

drop policy if exists "Service role can manage all projects" on public.projects;

create policy "Service role can manage all projects"
on public.projects
for all
to service_role
using (
  true
);


-- For deploys
alter table public.deploys
enable row level security;

drop policy if exists "Service role can manage all deploys" on public.deploys;

create policy "Service role can manage all deploys"
on public.deploys
for all
to service_role
using (
  true
);


-- ================================================
-- END OF MIGRATION - Enables service role to bypass RLS
-- ================================================
