-- Security checks: what logged-out visitors, app users, other users, and team members can do.
-- Run by tests/db/run.sh after applying the security script to the mock. Prints PASS/FAIL lines.
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned
create or replace function pg_temp.as_user(uid text, email text) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text, false) $$;
create or replace function pg_temp.check(label text, ok boolean) returns text language sql as $$ select case when ok then 'PASS  ' else 'FAIL  ' end || label $$;

-- New sign-ups (trigger fixed)
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
 ('22222222-2222-2222-2222-222222222222', 'public@example.test', now(), '{"name":"Pat"}'),
 ('33333333-3333-3333-3333-333333333333', 'other@example.test', now(), '{}');
select pg_temp.check('sign-up creates a profile with signup_source=app and the given name',
  (select display_name = 'Pat' and signup_source = 'app' from public.profiles where id = '22222222-2222-2222-2222-222222222222'));

-- Spoof attempt: someone signs up (unconfirmed) with an email that's on the team list
insert into public.team_access (email) values ('newhire@workandbrew.test');
insert into auth.users (id, email, email_confirmed_at) values ('44444444-4444-4444-4444-444444444444', 'newhire@workandbrew.test', null);

-- ===== Logged-out visitor (anon) =====
reset role; select set_config('request.jwt.claims', '', false); set role anon;
select pg_temp.check('anon sees 0 cafés in the raw table', (select count(*) = 0 from public.cafes));
select pg_temp.check('anon sees 0 profiles/emails', (select count(*) = 0 from public.profiles));
do $$ begin perform 1 from public.app_cafes; raise notice 'FAIL  anon can read app_cafes'; exception when insufficient_privilege then raise notice 'PASS  anon cannot read app_cafes (sign-in required)'; end $$;
do $$ begin insert into public.cafes (name) values ('spam'); raise notice 'FAIL  anon inserted a café'; exception when others then raise notice 'PASS  anon cannot add cafés'; end $$;
do $$ begin perform 1 from public.tasks; raise notice 'FAIL  anon can read tasks'; exception when insufficient_privilege then raise notice 'PASS  anon cannot touch tasks'; end $$;

-- ===== Regular app user =====
reset role; select pg_temp.as_user('22222222-2222-2222-2222-222222222222', 'public@example.test'); set role authenticated;
select pg_temp.check('app user sees 0 cafés in the raw table (internal notes hidden)', (select count(*) = 0 from public.cafes));
update public.cafes set name = 'hacked'; delete from public.cafes;
do $$ begin insert into public.cafes (name) values ('spam'); raise notice 'FAIL  app user inserted a café'; exception when others then raise notice 'PASS  app user cannot add cafés'; end $$;
select pg_temp.check('app user sees only their own profile', (select count(*) = 1 and bool_and(id = auth.uid()) from public.profiles));
select pg_temp.check('app user is not a team member', not public.is_team_member());
select pg_temp.check('app_cafes is empty until the team publishes', (select count(*) = 0 from public.app_cafes));
insert into public.tasks (text) values ('my task');
do $$ begin insert into public.tasks (user_id, text) values ('33333333-3333-3333-3333-333333333333', 'planted'); raise notice 'FAIL  app user wrote into another user''s tasks'; exception when others then raise notice 'PASS  app user cannot write another user''s tasks'; end $$;
insert into public.business_inquiries (name, email, topic, message) values ('Pat', 'pat@example.test', 'Press', 'hi');
select pg_temp.check('app user cannot read back inquiries (team only)', (select count(*) = 0 from public.business_inquiries));
insert into storage.objects (bucket_id, name) values ('avatars', '22222222-2222-2222-2222-222222222222/a.jpg');
do $$ begin insert into storage.objects (bucket_id, name) values ('avatars', '33333333-3333-3333-3333-333333333333/x.jpg'); raise notice 'FAIL  wrote into another user''s photo folder'; exception when others then raise notice 'PASS  cannot write another user''s photo folder'; end $$;
do $$ begin insert into storage.objects (bucket_id, name) values ('cafe-photos', 'x.jpg'); raise notice 'FAIL  app user uploaded a café photo'; exception when others then raise notice 'PASS  app user cannot upload café photos'; end $$;

-- ===== Unconfirmed spoofer with a team email =====
reset role; select pg_temp.as_user('44444444-4444-4444-4444-444444444444', 'newhire@workandbrew.test'); set role authenticated;
select pg_temp.check('unconfirmed account with a team email is NOT treated as team', not public.is_team_member());
select pg_temp.check('...and sees 0 raw cafés', (select count(*) = 0 from public.cafes));

-- ===== Other user =====
reset role; select pg_temp.as_user('33333333-3333-3333-3333-333333333333', 'other@example.test'); set role authenticated;
select pg_temp.check('another user cannot see Pat''s tasks', (select count(*) = 0 from public.tasks));
select pg_temp.check('another user cannot see Pat''s photo', (select count(*) = 0 from storage.objects where bucket_id = 'avatars'));

-- ===== Team member =====
reset role; select pg_temp.as_user('11111111-1111-1111-1111-111111111111', 'team@workandbrew.test'); set role authenticated;
select pg_temp.check('team member is recognized (email case-insensitive)', public.is_team_member());
select pg_temp.check('team sees all cafés, untouched by the app user', (select count(*) = 2 and bool_and(name <> 'hacked') from public.cafes));
update public.cafes set published = true, neighborhood = '[Neighborhood]' where name = 'Lalin''s';
insert into public.cafe_features (cafe_id, label) select id, case when published then 'pub' else 'hidden' end from public.cafes;
select pg_temp.check('team can publish a café', (select published from public.cafes where name = 'Lalin''s'));
select pg_temp.check('team can read inquiries', (select count(*) = 1 from public.business_inquiries));
select pg_temp.check('team can read profiles for the hub', (select count(*) >= 3 from public.profiles));
do $$ begin perform public.delete_my_account(); raise notice 'FAIL  team account deleted itself from the app'; exception when others then raise notice 'PASS  team accounts cannot be deleted from the app'; end $$;

-- ===== App user after publishing =====
reset role; select pg_temp.as_user('22222222-2222-2222-2222-222222222222', 'public@example.test'); set role authenticated;
select pg_temp.check('app user now sees exactly the 1 published café', (select count(*) = 1 from public.app_cafes));
select pg_temp.check('derived tags are right (wifi, outlets, seats8, noLimit, smallBiz)',
  (select tags @> array['wifi','outlets','seats8','noLimit','smallBiz'] from public.app_cafes));
select pg_temp.check('internal columns are not in the view',
  not exists (select 1 from information_schema.columns where table_name = 'app_cafes' and column_name in ('assigned_to','scout_name','notes','status','source')));
select pg_temp.check('app user sees features only for published cafés', (select count(*) = 1 and bool_and(label = 'pub') from public.cafe_features));
select public.delete_my_account();
reset role;
select pg_temp.check('delete my account removes the user, profile, and tasks',
  not exists (select 1 from auth.users where id = '22222222-2222-2222-2222-222222222222')
  and not exists (select 1 from public.profiles where id = '22222222-2222-2222-2222-222222222222')
  and not exists (select 1 from public.tasks where user_id = '22222222-2222-2222-2222-222222222222'));

-- Sign-up source detection
reset role;
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
 ('66666666-6666-6666-6666-666666666666', 'web@example.test', now(), '{"username":"webby","preferred_name":"Web"}');
select pg_temp.check('website sign-up is labeled website and uses preferred_name',
  (select display_name = 'Web' and signup_source = 'website' from public.profiles where id = '66666666-6666-6666-6666-666666666666'));
select pg_temp.check('"Only team members" café rule is restrictive',
  (select permissive = 'RESTRICTIVE' from pg_policies where tablename = 'cafes' and policyname = 'Only team members'));
