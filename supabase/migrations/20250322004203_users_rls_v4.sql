-- ================================================
-- users-rls-v4.sql
-- ================================================

-- Add RLS policies for users

alter table public.users
enable row level security;

drop policy if exists "Users can view their own user record" on public.users;
drop policy if exists "Users can update their own user record" on public.users;

-- Users can view and update their own records
create policy "Users can view their own user record"
on public.users for select 
to authenticated, anon 
using ( (select auth.uid()) = id );

create policy "Users can update their own user record"
on public.users for update
to authenticated, anon 
using ( (select auth.uid()) = id );

-- ================================================
-- END OF MIGRATION - Add RLS policies for users
-- ================================================
