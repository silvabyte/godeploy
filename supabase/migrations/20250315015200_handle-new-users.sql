-- ================================================
-- 008-handle-new-user.sql
-- ================================================
-- Function and Trigger to auto-create a Tenant when new user signs up

create function public.handle_new_user() 
returns trigger as $$
declare
  new_tenant_id uuid;
begin
  -- Create tenant
  insert into public.tenants (name)
  values (NEW.email || ' workspace')
  returning id into new_tenant_id;

  -- Link user to tenant
  insert into public.users (id, email, tenant_id)
  values (NEW.id, NEW.email, new_tenant_id);

  return NEW;
end;
$$ language plpgsql security definer;

create trigger create_tenant_on_signup
after insert on auth.users
for each row
execute function public.handle_new_user();