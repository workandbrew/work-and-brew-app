-- Work & Brew: read-only check to run AFTER the security script. Changes nothing.
select json_build_object(
  'cafes_rules', (select json_agg(policyname order by policyname) from pg_policies where schemaname = 'public' and tablename = 'cafes'),
  'profiles_rules', (select json_agg(policyname order by policyname) from pg_policies where schemaname = 'public' and tablename = 'profiles'),
  'open_rules_left', (
    select coalesce(json_agg(tablename || ': ' || policyname), '[]') from pg_policies
    where schemaname = 'public' and cmd in ('SELECT', 'ALL') and qual = 'true'),
  'app_tables_locked', (
    select json_object_agg(c.relname, c.relrowsecurity) from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname in ('saved_cafes', 'tasks', 'focus_sessions', 'user_settings', 'business_inquiries', 'issue_reports', 'cafe_features')),
  'logged_out_can_read_app_cafes', has_table_privilege('anon', 'public.app_cafes', 'select'),
  'signup_trigger_fixed', (select pg_get_functiondef('public.handle_new_user'::regproc) like '%signup_source%'),
  'published_cafes', (select count(*) from public.cafes where published),
  'buckets', (select json_agg(name || case when public then ' (public)' else ' (private)' end) from storage.buckets)
) as work_and_brew_check;
