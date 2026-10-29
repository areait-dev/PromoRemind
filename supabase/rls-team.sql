-- Utenti "team": vedono e modificano TUTTI i dati (condivisi tra loro).
-- Eseguire nel SQL Editor di Supabase.

begin;

-- Pulizia dell'eventuale versione "sola lettura" (se già eseguita)
drop policy if exists "viewer_read_aruba_panels"  on public.aruba_panels;
drop policy if exists "viewer_read_databases"     on public.databases;
drop policy if exists "viewer_read_db_slots"      on public.db_slots;
drop policy if exists "viewer_read_domains"       on public.domains;
drop policy if exists "viewer_read_pec_emails"    on public.pec_emails;
drop policy if exists "viewer_read_subscriptions" on public.subscriptions;
drop function if exists public.is_viewer();
drop table if exists public.viewer_users;

create table if not exists public.team_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.team_users enable row level security;
-- nessuna policy: non accessibile dal client, solo dal SQL Editor

create or replace function public.is_team_member()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.team_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_team_member() from public, anon;
grant execute on function public.is_team_member() to authenticated;

-- Accesso completo per i membri del team (si somma alle policy "owner_*")
create policy "team_aruba_panels"  on public.aruba_panels  for all to authenticated using (public.is_team_member()) with check (public.is_team_member());
create policy "team_databases"     on public.databases     for all to authenticated using (public.is_team_member()) with check (public.is_team_member());
create policy "team_db_slots"      on public.db_slots      for all to authenticated using (public.is_team_member()) with check (public.is_team_member());
create policy "team_domains"       on public.domains       for all to authenticated using (public.is_team_member()) with check (public.is_team_member());
create policy "team_pec_emails"    on public.pec_emails    for all to authenticated using (public.is_team_member()) with check (public.is_team_member());
create policy "team_subscriptions" on public.subscriptions for all to authenticated using (public.is_team_member()) with check (public.is_team_member());

insert into public.team_users (user_id) values
  ('d8210374-9963-4778-8669-07122771f94e'),
  ('341a12a1-e952-4a64-ab27-5a3ba65bdb3d')
on conflict do nothing;

commit;

select * from public.team_users;
