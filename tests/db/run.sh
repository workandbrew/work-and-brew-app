#!/usr/bin/env bash
# Runs the security script against a throwaway local Postgres that mimics Supabase,
# then prints PASS/FAIL for each access check. Needs PostgreSQL 15+ (initdb, pg_ctl, psql).
# Never touches the real Supabase project.
set -euo pipefail
cd "$(dirname "$0")/../.."
DIR=$(mktemp -d)
PORT=${PORT:-5499}
initdb -D "$DIR/data" -A trust >/dev/null
pg_ctl -D "$DIR/data" -o "-p $PORT -k $DIR" -l "$DIR/log" start >/dev/null
trap 'pg_ctl -D "$DIR/data" stop >/dev/null; rm -rf "$DIR"' EXIT
sleep 2
Q="psql -h $DIR -p $PORT -d postgres -q"
$Q -f tests/db/supabase_mock.sql
$Q -v ON_ERROR_STOP=1 -f supabase/migrations/20261112_01_security_and_app.sql >/dev/null 2>&1
$Q -v ON_ERROR_STOP=1 -f supabase/migrations/20261112_01_security_and_app.sql >/dev/null 2>&1 # must be safe to re-run
$Q -f tests/db/rls_checks.sql 2>&1 | grep -E "PASS|FAIL|ERROR" | sed 's/^psql.*NOTICE:  //; s/^NOTICE:  //' | tee "$DIR/results"
echo "---"; echo "$(grep -c PASS "$DIR/results") passed, $(grep -cE 'FAIL|ERROR' "$DIR/results" || true) failed"
! grep -qE 'FAIL|ERROR' "$DIR/results"
