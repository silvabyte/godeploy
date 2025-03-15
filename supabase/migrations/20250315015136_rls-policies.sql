-- ================================================
-- 007-rls-policies.sql
-- ================================================
-- Add RLS Policies for users, tenants, projects, deploys

-- Users can view and update their own records
create policy "Users can view their own user record"
on public.users for select
using (id = auth.uid());

create policy "Users can update their own user record"
on public.users for update
using (id = auth.uid());

-- Users can view only their own tenant
create policy "Users can view their own tenant"
on public.tenants for select
using (id = (select tenant_id from public.users where id = auth.uid()));

-- Tenant scoped access for projects
create policy "Tenant can manage their projects"
on public.projects
for all
using (tenant_id = (select tenant_id from public.users where id = auth.uid()))
with check (tenant_id = (select tenant_id from public.users where id = auth.uid()));

-- Tenant scoped access for deploys
create policy "Tenant can manage their deploys"
on public.deploys
for all
using (tenant_id = (select tenant_id from public.users where id = auth.uid()))
with check (tenant_id = (select tenant_id from public.users where id = auth.uid()));