# Work & Brew — Testing

| Field | Detail |
| --- | --- |
| QA owner | Christopher Essuman |
| Last updated | 2026-11-12 |
| Related | [TRD.md](TRD.md) (requirement IDs) · [APP_FLOW.md](APP_FLOW.md) (screens) · [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) |

What we test, how, and what "pass" means. Automated checks run in minutes and catch regressions; the manual device pass catches what only a real phone shows.

---

## 1. Test types at a glance

| Layer | What it proves | How | When |
| --- | --- | --- | --- |
| Database security | Each role (logged-out, app user, other user, team) can do only what it should | `tests/db/run.sh` (automated, 32 checks) | Before any database change goes live |
| Live database check | The real project matches the tested rules | `supabase/verify.sql` + Security Advisor | After running a migration |
| App click-through | Main flows work and the console has no errors | `tests/e2e/run.sh` (headless browser) | Before every merge |
| Screen sizes | No overflow or broken layout from iPhone SE to iPad landscape | `tests/e2e/sizes.js` (part of `run.sh`) | Before every merge |
| Device QA | Real iOS / iPadOS / Android behavior | Manual checklist (§4) on Expo Go, then TestFlight / Play closed test | Every release candidate |
| Website launch checks | The 20-item launch list | §5 | Before website releases |

## 2. Database security

### 2.1 Automated: `tests/db/run.sh`
Starts a throwaway local Postgres that mimics Supabase (roles `anon` and `authenticated`, `auth.uid()`, storage), loads a copy of the project's setup as of Nov 12 (`tests/db/supabase_mock.sql`), runs the security script **twice** (it must be safe to re-run), then runs `tests/db/rls_checks.sql`.

```bash
# needs PostgreSQL 15+ (initdb, pg_ctl, psql) on PATH; never touches the real project
bash tests/db/run.sh
# → "32 passed, 0 failed"
```

What it covers:

| Who | Must be true |
| --- | --- |
| Logged-out visitor | Sees 0 cafés and 0 profiles; can't read `app_cafes`, add cafés or touch tasks |
| App user | Sees 0 raw cafés; can't add, edit or delete cafés; sees only their own profile; isn't a team member; can't write another user's tasks or photo folder; can't upload café photos; can submit forms but not read them back |
| Unconfirmed account with a team email | Is **not** treated as team |
| Another user | Can't see the first user's tasks or photo |
| Team member | Recognized (email case doesn't matter); sees all cafés; can publish; reads inquiries and profiles; can't delete their account from the app |
| After publishing | The app user sees exactly the published café, with correct derived tags and no internal columns, plus its feature only |
| Account deletion | Removes the user, profile and tasks |
| Sign-up | App sign-ups → `signup_source = app`; website sign-ups → `website` using `preferred_name` |
| Café rules | "Only team members" is **restrictive** |

The script also has a safety stop: it refuses to run if a team account has an unconfirmed email. That case was tested separately (it stopped, and the café rules were left unchanged).

**Add a check here whenever you add a table or a rule.**

### 2.2 After running a migration on the real project
1. Run `supabase/verify.sql` in the SQL Editor. Expected:
   - `cafes_rules`: `Only team members (restrictive)`, `Team members can use cafes (permissive)`, nothing else.
   - `profiles_rules`: `Team can read profiles`, `Users manage own profile`.
   - `open_rules_left`: `[]`
   - `app_tables_locked`: every value `true`
   - `logged_out_can_read_app_cafes`: `false`
   - `signup_trigger_fixed`: `true`
   - `buckets`: `avatars (private)`, `cafe-photos (private)`
2. Database → Advisors → **Security Advisor**: only the intentional "security definer view" warning on `app_cafes` should remain.
3. Create a throwaway account in the app (or Authentication → Add user) and confirm it gets a profile row.

### 2.3 Website / hub smoke test after a database change
Logged in as a team member: Team Hub loads; Scout map (`/scout-map.html`) shows cafés and saves edits; SMS pages load. Logged out: the public map on the home page still shows cafés (it reads the Google Sheet feed, not Supabase).

## 3. App automated checks

### 3.1 Click-through + screen sizes: `tests/e2e/run.sh`
Builds the web version, serves it, and drives it in headless Chromium.

```bash
npm i -D playwright@1.63.0 && npx playwright install chromium   # one time
bash tests/e2e/run.sh
```

`flow.js` covers: create account → My list → wallet reorder → Top 4 → café detail → save → start session (clock runs) → brain dump → check off task → expand / pause / collapse timer → Saved count → **nav slide gesture** → quick filter → map pin pop-up → filters reset / tabs → search → edit profile (name + borough picker) → business form validation + send → report pre-fill from café → data persists after reload → log out. Any `FAIL` line or console error fails the run.

`sizes.js` covers Explore, Map, Café detail, Focus, Profile and Edit profile at **320×568, 390×844, 820×1180 and 1180×820**, checks for horizontal overflow and tab re-tap behavior, and saves screenshots.

**Limits:** the web build doesn't exercise native-only behavior (keychain, photo picker, haptics, Apple / Google sign-in sheets, real map). Those are covered in §4.

## 4. Manual device QA (release candidate)

**Devices:** iPhone SE or mini (small), a recent iPhone, an iPad (portrait **and** landscape), an Android phone, an Android tablet if available.
**Builds:** Expo Go for quick passes; TestFlight / Play closed test for release candidates.
**Accounts:** one brand-new account per run, one existing app account, one team account. Never test with real customer accounts.

### 4.1 Sign-in and account
- [ ] Create account → confirmation email arrives → link confirms → lands on Explore
- [ ] Wrong password, unconfirmed email and no connection each show a clear message
- [ ] Forgot password → email → reset → can log in with the new password
- [ ] Google sign-in (if shipped) and Sign in with Apple (iOS)
- [ ] Close and reopen the app → still signed in; after log out → lands on Log in, and the next account sees **none** of the previous user's data
- [ ] Delete account → confirm → signed out; logging in again fails; a team account is refused

### 4.2 Explore and café of the week
- [ ] Hero photo, name, highlights and rating load; My list toggles and shows in Saved
- [ ] Wallet: tapping a back card brings it forward; tapping the front card opens it
- [ ] Top 4 and "Because you saved…" open the right café
- [ ] Article: See on map, and Work here (timer starts at that café)

### 4.3 Map, filters, search
- [ ] Pins appear; tapping a pin shows the pop-up; tapping it opens the detail sheet
- [ ] Neighborhood / borough chips and quick filters change the pins and the count
- [ ] Filters: the tabs scroll to their section; Reset works; "Show N cafés" matches the list
- [ ] Search finds by name, neighborhood and borough; the empty state reads well
- [ ] Café detail: chips, gallery, amenity values match the database row; Directions opens Maps; bookmark state is right; Report pre-fills the café

### 4.4 Focus
- [ ] Start / pause / reset; switching tabs and coming back keeps the time
- [ ] A full session (or a shortened test build) logs the session and starts the break; the profile stats and "Your week" update
- [ ] Hold the clock → skips; only the minutes actually focused are logged
- [ ] Brain dump adds a task; tap checks it; the dot cycles priority; long press deletes
- [ ] Expanded view: Up next lists the right tasks; collapse works
- [ ] Changes appear on a second device logged into the same account

### 4.5 Saved and Profile
- [ ] Saved list tabs, remove (X), empty states, Notify me
- [ ] Edit profile: photo upload (and its 5 MB limit), 150-character About counter, pills, borough picker; Save persists after an app restart
- [ ] Notification and privacy toggles persist; Location off → the locate button explains
- [ ] Business inquiry: a missing field or bad email is rejected; success screen; the row appears in Supabase for the team only
- [ ] Report an issue: same; café suggestions while typing
- [ ] Terms / Privacy Policy show real text

### 4.6 Everywhere
- [ ] Every screen at small phone, large phone, iPad portrait and landscape: nothing cut off, no horizontal scroll
- [ ] Notch / Dynamic Island and the home indicator don't cover content; the nav floats above the home indicator
- [ ] Nav: tap, slide-and-release, and re-tap returns to the tab's first screen
- [ ] Android back gesture behaves like the round back button
- [ ] Airplane mode: cached cafés still show; errors are friendly; changes sync when back online
- [ ] VoiceOver / TalkBack: buttons are announced with clear names
- [ ] Larger text setting: nothing important clipped

### 4.7 Pre-submission (both stores)
- [ ] Production build points at the production Supabase project; no test or sample data visible
- [ ] App Privacy / Data safety answers match what the app collects (TRD §5)
- [ ] Account deletion works in the app **and** on the web deletion page
- [ ] Privacy Policy and Terms URLs work from the store listing
- [ ] Screenshots are from the current build

## 5. Website launch checks (`work-and-brew-website`)

Items from the 20-point launch list; 7 (social image) and 19 (analytics) are already done. Statuses are tracked in IMPLEMENTATION_PLAN.md Phase 4.

| # | Check | How to verify | Pass when |
| --- | --- | --- | --- |
| 1, 2 | Privacy and Terms pages | Open `/privacy`, `/terms`; footer links | Real, current text; covers Supabase accounts, GA4, the waitlist email, SMS |
| 3 | No secrets in the browser | `npm run build`, then search `dist/` for `service_role`, `sb_secret_`, `TWILIO`, `BREVO` | No matches (the public anon and MapTiler keys are expected) |
| 4 | HTTPS + headers | `curl -sI http://workandbrew.app` → 301/308 to https; `curl -sI https://workandbrew.app` | `strict-transport-security`, `x-content-type-options`, `referrer-policy`, `x-frame-options` present |
| 5 | Cookie consent | Fresh private window | No GA cookies or `collect` requests until "Accept"; "Decline" keeps it that way |
| 6 | Meta | View source / tab title on every route | A unique title and description per page |
| 8 | Favicon | Browser tab, iOS home screen, Android | Icon shows everywhere |
| 9 | Sitemap + robots | `/sitemap.xml`, `/robots.txt` | Public pages listed; `/team`, `/ops`, `/dashboard`, `/settings` disallowed |
| 10 | Alt text | axe scan + manual review | Every meaningful image has descriptive alt; decorative ones have `alt=""` |
| 11 | Images | Network tab on Home / About | No HEIC served; no image over ~300 KB above the fold |
| 12 | Speed | Lighthouse, mobile | Performance ≥ 80, LCP < 2.5 s, CLS < 0.1 |
| 13 | Contrast | axe + Lighthouse accessibility | No contrast violations; Accessibility ≥ 90 |
| 14 | Mobile | 320, 390, 768, 1280 px | No horizontal scroll; tap targets ≥ 44 px |
| 15 | 404 | Visit `/does-not-exist` | Custom page, link home, `noindex` |
| 16 | Links | Link crawler over the built site | 0 broken internal links or assets |
| 17 | Forms | Submit empty / invalid / valid on every form | Clear field errors; server rejects invalid input too |
| 18 | Spam | Submit with the honeypot filled; rapid repeats | Rejected; the human check is required on public forms |
| 20 | CTA | Home above the fold | One primary action, visually dominant |

## 6. Reporting bugs

File bugs in Jira with: device + OS version, build (Expo Go / TestFlight / Play test + version), account type (new / existing / team), steps, expected vs actual, and a screenshot or screen recording. Security bugs go straight to Denisse and David, not into a public channel.
