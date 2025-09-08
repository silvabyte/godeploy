-- Add optional commit metadata to deploys
alter table public.deploys
  add column if not exists commit_sha text,
  add column if not exists commit_branch text,
  add column if not exists commit_message text,
  add column if not exists commit_url text;

-- Optional: composite index for project_id and created_at for time series
create index if not exists idx_deploys_project_created on public.deploys(project_id, created_at);

