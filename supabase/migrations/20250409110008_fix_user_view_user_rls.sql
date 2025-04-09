-- ================================================
-- fix_user_view_user_rls.sql
-- ================================================

-- Drop previous multi-tenant user visibility policy
drop policy if exists "Users can view users in their tenants" on public.users;

-- Restore simple self-view policy
create policy "Users can view their own user record"
  on public.users
  for select
  to authenticated
  using (id = auth.uid());


-- Tenant scoped access for deploys
drop policy if exists "Tenant can manage their deploys" on public.deploys;


-- Tenant scoped access for projects
drop policy if exists "Tenant can manage their projects" on public.projects;

create policy "Tenant can manage their projects"
    on public.projects
    for all
    to authenticated
    using (tenant_id = any(public.get_user_tenants(auth.uid())))
    with check (tenant_id = any(public.get_user_tenants(auth.uid())));


-- Tenant scoped access for tenants
drop policy if exists "Users can view their own tenant" on public.tenants;

create policy "Users can view their own tenant"
    on public.tenants
   for select
    to authenticated
    using (id = any(public.get_user_tenants(auth.uid())));