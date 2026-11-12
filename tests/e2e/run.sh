#!/usr/bin/env bash
# Builds the web version, serves it, and runs the click-through and screen-size checks
# in a headless browser. Needs Playwright with Chromium:
#   npm i -D playwright@1.63.0 && npx playwright install chromium
set -euo pipefail
cd "$(dirname "$0")/../.."
OUT=$(mktemp -d)
CI=1 npx expo export --platform web --output-dir "$OUT/web" >/dev/null
node tests/e2e/serve.js "$OUT/web" & SERVER=$!
trap 'kill $SERVER; rm -rf "$OUT"' EXIT
sleep 1
mkdir -p "$OUT/shots"
node tests/e2e/flow.js "$OUT/shots"
node tests/e2e/sizes.js "$OUT/shots"
echo "Screenshots: $OUT/shots (deleted on exit; copy them first if you need them)"
