-- ================================================
-- 009-rls-bypass-for-service-role.sql
-- ================================================

-- For tenants
alter table public.tenants
enable row level security;

drop policy if exists "Users can view their own tenant" on public.tenants;

create policy "Users can view their own tenant"
on public.tenants
for select
using (
  (auth.role() = 'service_role') -- Bypass RLS when using service role
  OR
  id = (select tenant_id from public.users where id = auth.uid())
);


-- For users
alter table public.users
enable row level security;

drop policy if exists "Users can view their own user record" on public.users;
drop policy if exists "Users can update their own user record" on public.users;

create policy "Users can view their own user record"
on public.users
for select
using (
  (auth.role() = 'service_role')
  OR
  id = auth.uid()
);

create policy "Users can update their own user record"
on public.users
for update
using (
  (auth.role() = 'service_role')
  OR
  id = auth.uid()
);


-- For projects
alter table public.projects
enable row level security;

drop policy if exists "Tenant can manage their projects" on public.projects;

create policy "Tenant can manage their projects"
on public.projects
for all
using (
  (auth.role() = 'service_role')
  OR
  tenant_id = (select tenant_id from public.users where id = auth.uid())
)
with check (
  (auth.role() = 'service_role')
  OR
  tenant_id = (select tenant_id from public.users where id = auth.uid())
);


-- For deploys
alter table public.deploys
enable row level security;

drop policy if exists "Tenant can manage their deploys" on public.deploys;

create policy "Tenant can manage their deploys"
on public.deploys
for all
using (
  (auth.role() = 'service_role')
  OR
  tenant_id = (select tenant_id from public.users where id = auth.uid())
)
with check (
  (auth.role() = 'service_role')
  OR
  tenant_id = (select tenant_id from public.users where id = auth.uid())
);

-- ================================================
-- END OF MIGRATION - Enables service role to bypass RLS
-- ================================================
