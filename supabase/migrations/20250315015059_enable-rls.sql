-- ================================================
-- enable-rls.sql
-- ================================================
-- Enable Row Level Security for all tables
alter table public.projects enable row level security;
alter table public.tenants enable row level security;
alter table public.users enable row level security;
alter table public.deploys enable row level security;