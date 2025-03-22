-- ================================================
-- 010-fix-users-rls.sql
-- ================================================

-- For users
alter table public.users
enable row level security;

drop policy if exists "Users can view their own user record" on public.users;
drop policy if exists "Users can update their own user record" on public.users;

CREATE POLICY "Allow users to read their own data" 
ON public.users 
FOR SELECT
TO authenticated, service_role 
USING (id = auth.uid());

CREATE POLICY "Allow users to update their own data" 
ON public.users 
FOR UPDATE
TO authenticated, service_role 
USING (id = auth.uid());
