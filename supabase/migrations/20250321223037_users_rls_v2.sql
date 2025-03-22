-- ================================================
-- 013-users-rls-v2.sql
-- ================================================

-- Add RLS policies for users

alter table public.users
enable row level security;

drop policy if exists "Allow users to read their own data" on public.users;
drop policy if exists "Allow users to update their own data" on public.users;

-- Users can view and update their own records
create policy "Users can view their own user record"
on public.users for select
to authenticated
using (id = auth.uid());

create policy "Users can update their own user record"
on public.users for update
to authenticated
using (id = auth.uid());

-- ================================================
-- END OF MIGRATION - Add RLS policies for users
-- ================================================
