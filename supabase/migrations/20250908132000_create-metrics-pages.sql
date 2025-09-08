-- Ensure UUID extension is available (idempotent)
create extension if not exists "uuid-ossp" with schema extensions;

-- Create metrics_pages table for public metrics pages
create table public.metrics_pages (
  id uuid primary key default extensions.uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete cascade,
  slug text not null unique,
  title text,
  description text,
  project_ids uuid[] not null,
  is_public boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_metrics_pages_tenant_id on public.metrics_pages(tenant_id);

-- Enable RLS
alter table public.metrics_pages enable row level security;

-- Public read policy: allow public select by slug when is_public is true
drop policy if exists "Public can view public metrics pages by slug" on public.metrics_pages;
create policy "Public can view public metrics pages by slug"
on public.metrics_pages
for select
to public
using (is_public = true);

-- Owner manage policy: tenants can manage their pages
drop policy if exists "Tenant can manage their metrics pages" on public.metrics_pages;
create policy "Tenant can manage their metrics pages"
on public.metrics_pages
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
