-- Utenti con accesso in SOLA LETTURA a tutti i dati (oltre ai propri).
-- Eseguire nel SQL Editor di Supabase.

create table if not exists public.viewer_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.viewer_users enable row level security;
-- nessuna policy: la tabella non è leggibile/scrivibile dal client, solo dal SQL Editor

create or replace function public.is_viewer()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.viewer_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_viewer() from public, anon;
grant execute on function public.is_viewer() to authenticated;

-- Policy di sola lettura (si sommano a quelle "owner_*" esistenti)
create policy "viewer_read_aruba_panels"  on public.aruba_panels  for select to authenticated using (public.is_viewer());
create policy "viewer_read_databases"     on public.databases     for select to authenticated using (public.is_viewer());
create policy "viewer_read_db_slots"      on public.db_slots      for select to authenticated using (public.is_viewer());
create policy "viewer_read_domains"       on public.domains       for select to authenticated using (public.is_viewer());
create policy "viewer_read_pec_emails"    on public.pec_emails    for select to authenticated using (public.is_viewer());
create policy "viewer_read_subscriptions" on public.subscriptions for select to authenticated using (public.is_viewer());

-- Abilita l'utente
insert into public.viewer_users (user_id)
values ('abab169f-89a9-488c-ad4a-631507c74eb6')
on conflict do nothing;

-- Verifica
select * from public.viewer_users;
