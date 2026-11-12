-- Work & Brew: read-only snapshot of how the Supabase project is set up.
-- Safe to run any time. It changes nothing and returns no emails or personal data.
-- Run in Supabase Dashboard -> SQL Editor, then copy the single JSON result.
select json_build_object(
  'tables', (
    select coalesce(json_agg(t order by t.name), '[]')
    from (
      select c.relname as name,
             c.relrowsecurity as rls_on,
             c.reltuples::bigint as approx_rows,
             (select json_agg(a.attname || ' ' || format_type(a.atttypid, a.atttypmod) order by a.attnum)
                from pg_attribute a
               where a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped) as columns
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where c.relkind in ('r', 'p', 'v') and n.nspname = 'public'
    ) t
  ),
  'policies', (
    select coalesce(json_agg(json_build_object(
      'table', tablename, 'name', policyname, 'command', cmd, 'kind', lower(permissive),
      'roles', roles, 'using', qual, 'check', with_check)), '[]')
    from pg_policies where schemaname in ('public', 'storage')
  ),
  'public_functions', (
    select coalesce(json_agg(p.proname), '[]')
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  ),
  'triggers_on_auth_users', (
    select coalesce(json_agg(json_build_object('name', tgname, 'function', tgfoid::regproc::text)), '[]')
    from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal
  ),
  'storage_buckets', (
    select coalesce(json_agg(json_build_object('name', name, 'public', public)), '[]')
    from storage.buckets
  ),
  'auth_users', (
    select json_build_object(
      'count', count(*),
      'sign_in_providers', (select coalesce(json_agg(distinct provider), '[]') from auth.identities))
    from auth.users
  ),
  'extensions', (select coalesce(json_agg(extname), '[]') from pg_extension)
) as work_and_brew_setup;
