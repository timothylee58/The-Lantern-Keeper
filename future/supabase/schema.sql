-- Optional future cloud journal. Not applied to any project.
create table if not exists public.field_journals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  journal jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.field_journals enable row level security;
create policy "Read own field journal" on public.field_journals for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own field journal" on public.field_journals for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own field journal" on public.field_journals for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own field journal" on public.field_journals for delete to authenticated using ((select auth.uid()) = user_id);
