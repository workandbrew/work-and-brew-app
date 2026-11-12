-- Stand-in for Supabase's roles (anon, authenticated), auth.uid()/auth.jwt(), and storage,
-- plus a copy of the project's setup as of Nov 12, 2026 (before the security script).
-- Used by tests/db/run.sh. Never run this against the real project.
-- Minimal stand-in for Supabase's roles, auth and storage, plus the project's current setup.
create role anon nologin; create role authenticated nologin;
create schema auth; create schema storage;
grant usage on schema public, auth, storage to anon, authenticated;
create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(current_setting('request.jwt.claims', true)::jsonb, '{}') $$;
create function auth.role() returns text language sql stable as $$ select coalesce(auth.jwt() ->> 'role', current_user) $$;
grant execute on all functions in schema auth to anon, authenticated;
create table storage.buckets (id text primary key, name text, public boolean);
create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text, owner uuid);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql as $$ select string_to_array(name, '/') $$;
grant select, insert, update, delete on storage.objects to anon, authenticated;
grant execute on function storage.foldername(text) to anon, authenticated;

create table public.team_access (email text, name text, created_at timestamptz default now());
create table public.hub_admins (email text, name text, role text, created_at timestamptz default now());
alter table public.team_access enable row level security; alter table public.hub_admins enable row level security;
create table public.profiles (id uuid primary key references auth.users(id), email text, display_name text, signup_source text, created_at timestamptz default now());
alter table public.profiles enable row level security;
create policy "Users manage own profile" on public.profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create table public.cafes (id serial primary key, number text, name text, address text, borough text, zipcode text,
  latitude double precision, longitude double precision, status text, assigned_to text, source text, description text,
  wifi boolean, secured boolean, outlets boolean, hot_food boolean, restroom boolean, seats text, time_restrict boolean,
  restrict_note text, scout_name text, notes text, updated_at timestamptz default now());
alter table public.cafes enable row level security;
-- the project's original is_team_member (trusts the JWT email)
create function public.is_team_member() returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (select 1 from public.team_access where lower(email) = lower(auth.jwt() ->> 'email'))
      or exists (select 1 from public.hub_admins where lower(email) = lower(auth.jwt() ->> 'email')); $$;
create policy "Auth insert" on public.cafes for insert with check (auth.role() = 'authenticated');
create policy "Auth update" on public.cafes for update using (auth.role() = 'authenticated');
create policy "Auth delete" on public.cafes for delete using (auth.role() = 'authenticated');
create policy "Auth read" on public.cafes for select using (true);
create policy "Team members can use cafes" on public.cafes for all to authenticated using (is_team_member()) with check (is_team_member());
create policy "Only team members" on public.cafes as restrictive for all to anon, authenticated using (is_team_member()) with check (is_team_member());
-- the broken original trigger
create function public.handle_new_user() returns trigger language plpgsql security definer as $$
begin insert into public.profiles (id, username, preferred_name) values (new.id, new.raw_user_meta_data ->> 'username', new.raw_user_meta_data ->> 'preferred_name'); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated;

-- data: an existing team member (created before the trigger broke) + cafés
alter table auth.users disable trigger on_auth_user_created;
insert into auth.users values ('11111111-1111-1111-1111-111111111111', 'team@workandbrew.test', now(), '{}');
alter table auth.users enable trigger on_auth_user_created;
insert into public.profiles values ('11111111-1111-1111-1111-111111111111', 'team@workandbrew.test', 'Team Member', 'website');
insert into public.team_access (email, name) values ('TEAM@workandbrew.test', 'Team Member');
insert into public.cafes (name, address, borough, status, assigned_to, scout_name, notes, source, wifi, secured, outlets, seats, time_restrict)
values ('Lalin''s', '1131 Test St', 'Brooklyn', 'In Review', 'Ana', 'Ana', 'internal note', 'DB small_biz', true, true, true, 'Many', false),
       ('Hidden Café', '1 Secret Ave', 'Queens', 'Unvisited', 'Bo', 'Bo', 'do not share', 'OSM scan (v8)', null, null, null, null, null);
