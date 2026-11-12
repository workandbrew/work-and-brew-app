-- Work & Brew: second read-only snapshot. Changes nothing.
-- Returns function code and category counts only (no names, phones, or emails from rows).
select json_build_object(
  'functions', (
    select coalesce(json_agg(json_build_object(
      'name', p.proname,
      'security_definer', p.prosecdef,
      'definition', pg_get_functiondef(p.oid)) order by p.proname), '[]')
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prokind = 'f'
  ),
  'triggers_on_public_tables', (
    select coalesce(json_agg(json_build_object(
      'table', c.relname, 'name', t.tgname, 'function', t.tgfoid::regproc::text)), '[]')
    from pg_trigger t join pg_class c on c.oid = t.tgrelid join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and not t.tgisinternal
  ),
  'event_triggers', (select coalesce(json_agg(evtname), '[]') from pg_event_trigger),
  'cafes_by_status', (
    select json_object_agg(k, n) from (select coalesce(status, '(blank)') k, count(*) n from public.cafes group by 1) s
  ),
  'cafes_by_borough', (
    select json_object_agg(k, n) from (select coalesce(borough, '(blank)') k, count(*) n from public.cafes group by 1) s
  ),
  'cafes_by_source', (
    select json_object_agg(k, n) from (select coalesce(source, '(blank)') k, count(*) n from public.cafes group by 1) s
  ),
  'cafes_seats_values', (
    select json_object_agg(k, n) from (select coalesce(seats, '(blank)') k, count(*) n from public.cafes group by 1) s
  ),
  'cafes_filled_in', (
    select json_build_object(
      'with_description', count(*) filter (where coalesce(description, '') <> ''),
      'with_coordinates', count(*) filter (where latitude is not null and longitude is not null),
      'with_wifi_answer', count(*) filter (where wifi is not null),
      'with_outlets_answer', count(*) filter (where outlets is not null))
    from public.cafes
  ),
  'profiles_by_signup_source', (
    select json_object_agg(k, n) from (select coalesce(signup_source, '(blank)') k, count(*) n from public.profiles group by 1) s
  ),
  'profiles_vs_users', json_build_object(
    'profiles', (select count(*) from public.profiles),
    'auth_users', (select count(*) from auth.users),
    'team_access_rows', (select count(*) from public.team_access),
    'hub_admins_rows', (select count(*) from public.hub_admins))
) as work_and_brew_setup_2;
