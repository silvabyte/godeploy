-- ================================================
-- fix_manage_tenant_users_rls.sql
-- ================================================

drop policy if exists "Tenant owners can manage tenant users" on public.tenant_users;

create policy "Tenant owners can manage tenant users"
  on public.tenant_users
  for all
  to authenticated
  using (
    exists (
      select 1 from public.tenant_users
      where tenant_id = tenant_users.tenant_id
      and user_id = auth.uid()
      and role = 'owner'
    )
  )
  with check (
    exists (
      select 1 from public.tenant_users
      where tenant_id = tenant_users.tenant_id
      and user_id = auth.uid()
      and role = 'owner'
    )
  );