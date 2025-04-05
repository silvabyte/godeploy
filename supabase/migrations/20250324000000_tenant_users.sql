-- ================================================
-- Add tenant_users table for many-to-many relationship
-- ================================================

-- Create tenant_users junction table
create table public.tenant_users (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    user_id uuid not null references public.users(id) on delete cascade,
    role text not null default 'member', -- 'owner', 'admin', 'member'
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique(tenant_id, user_id)
);

-- Create indexes for performance
create index idx_tenant_users_tenant_id on public.tenant_users(tenant_id);
create index idx_tenant_users_user_id on public.tenant_users(user_id);

-- Enable RLS
alter table public.tenant_users enable row level security;

-- Create RLS policies
create policy "Users can view their tenant memberships"
    on public.tenant_users
    for select
    to authenticated
    using (user_id = auth.uid());

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
    );

create policy "Service role can manage tenant users"
    on public.tenant_users
    for all
    to service_role
    using (true)
    with check (true);

-- Migrate existing user-tenant relationships
insert into public.tenant_users (tenant_id, user_id, role)
select tenant_id, id, 'owner'
from public.users
where tenant_id is not null;

-- Remove tenant_id from users table
alter table public.users
    drop constraint users_tenant_id_fkey,
    drop constraint users_tenant_id_key,
    drop column tenant_id;

-- Update RLS policies for other tables to use tenant_users
create or replace function public.get_user_tenants(user_id uuid)
returns setof uuid
language sql
security definer
as $$
    select tenant_id from public.tenant_users where user_id = $1;
$$;

-- Update projects policy
drop policy if exists "Users can view their projects" on public.projects;
create policy "Users can view their projects"
    on public.projects
    for select
    to authenticated
    using (tenant_id = any(public.get_user_tenants(auth.uid())));

-- Update deploys policy
drop policy if exists "Users can view their deploys" on public.deploys;
create policy "Users can view their deploys"
    on public.deploys
    for select
    to authenticated
    using (tenant_id = any(public.get_user_tenants(auth.uid())));

-- Update subscriptions policy
drop policy if exists "Tenant can manage their subscriptions" on public.subscriptions;
create policy "Tenant can manage their subscriptions"
    on public.subscriptions
    for all
    to authenticated
    using (tenant_id = any(public.get_user_tenants(auth.uid())))
    with check (tenant_id = any(public.get_user_tenants(auth.uid()))); 