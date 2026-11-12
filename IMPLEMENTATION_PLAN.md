# Work & Brew — Implementation Plan

| Field | Detail |
| --- | --- |
| Owner | Denisse Medina Flores (PM / frontend) · David Torres (backend) |
| Last updated | 2026-11-12 |
| Covers | Mobile app (`workandbrew/work-and-brew-app`) and website / hub (`workandbrew/work-and-brew-website`) |
| Related | [TRD.md](TRD.md) (requirement IDs below) · [APP_FLOW.md](APP_FLOW.md) · [TESTING.md](TESTING.md) · Confluence *Roadmap*, *Sprint Planning*, *Decision Log* |

Status: ✅ done · 🟡 in progress · ⬜ not started · ⛔ blocked (blocker named)

---

## 0. Where we are (Nov 12)

| Item | Plan (Confluence) | Reality |
| --- | --- | --- |
| Store submission | ~Nov 10 (Sprint 3) | ⬜ not submitted: no store builds yet |
| Launch date | **Nov 22** (Roadmap, Decision Log) or **Nov 30** (App PRD v1.2) | ⛔ decision needed: the two pages disagree |
| App UI | Sprints 1–2 | ✅ all 20 wireframe screens built, iPhone SE → iPad |
| Backend connection | Sprint 1 | 🟡 security + schema script written and tested (32/32); not yet run on the real project |
| Verified cafés | ~250 (Roadmap) / 300+ (PRD) | 74 complete (scout audit, Nov 11) |

**Recommendation:** decide the launch date first. Both stores take time: Apple review is usually 1–3 days, but plan for one rejection. A Google Play **personal** developer account needs a 14-day closed test with 12+ testers before production; an **organization** account skips it. With either date, the Android closed test has to start immediately, so Phase 5 (store setup) should run in parallel with Phases 2–4, not after.

## Decisions needed (blocking)

| # | Decision | Needed for | Owner |
| --- | --- | --- | --- |
| D1 | Launch date: Nov 22 or Nov 30 (or later) | Everything | Denisse |
| D2 | 5-tab design (Explore, Map, Focus, Saved, Profile) replaces the PRD's 4 tabs? | Phase 3 | Denisse + David |
| D3 | Ship Google sign-in at launch? If yes, Sign in with Apple is required on iOS (TRD AUTH-4). | Phase 2 | Denisse |
| D4 | Ship the Eisenhower Matrix at launch, or as the v2 fast-follow the decision log allows? | Phase 3 | Denisse |
| D5 | Quick filter chips: wireframe set vs café map review set ("Open late" is out of v1 scope) | Phase 3 | Denisse + David |
| D6 | Google Play account type (personal vs organization) | Phase 5 | Denisse |
| D7 | Make both GitHub repos private? | Now | Denisse |

---

## Phase 1 — Lock down Supabase ⏱ ~1 hour · Owner: Denisse (run), Claude (prepare)

| # | Task | Status |
| --- | --- | --- |
| 1.1 | Read-only inventory of the live project (`supabase/inventory.sql`, `inventory-2.sql`) | ✅ |
| 1.2 | Security + app-tables script `supabase/migrations/20261112_01_security_and_app.sql` (TRD §5–6) | ✅ written · tested 32/32 in `tests/db` |
| 1.3 | **Back up** `cafes`, `profiles`, `team_access`, `hub_admins`, `sms_contacts` to CSV (Table Editor → Export) | ⬜ |
| 1.4 | Run the script in the SQL Editor; then run `supabase/verify.sql` and compare with TESTING.md §2.2 | ⬜ |
| 1.5 | Auth settings: Confirm email on, password ≥ 8, leaked-password check, 2FA for the 4 hub admins, exact redirect URLs (TRD SEC-11, AUTH-8) | ⬜ |
| 1.6 | Supabase **Security Advisor**: resolve everything except the intentional `app_cafes` view | ⬜ |
| 1.7 | Website: check the team hub and scout map still work (TESTING.md §2.3) | ⬜ |
| 1.8 | Website saved lists: `saved_lists` / `list_cafes` from the website's `supabase/schema.sql` aren't in the live project, so the dashboard's saved lists likely fail. Decide whether to create them or retire the feature. | ⬜ |

## Phase 2 — Connect the app to Supabase ⏱ 3–4 days · Owner: Claude + Denisse; David reviews

| # | Task | TRD | Status |
| --- | --- | --- | --- |
| 2.1 | `.env` with URL + anon key; `src/lib/supabase.js` client; session in `expo-secure-store` | SEC-9, SEC-10 | ⬜ |
| 2.2 | Local demo mode keeps working when `.env` is missing | §4 | ⬜ |
| 2.3 | Email + password log-in and sign-up screens (styled like W20), with clear errors | AUTH-1 | ⬜ |
| 2.4 | Password reset by email | AUTH-2 | ⬜ |
| 2.5 | Google sign-in (if D3) and Sign in with Apple (dev build) | AUTH-3/4 | ⛔ D3 |
| 2.6 | Cafés from `app_cafes`; Café of the Week from `cafe_features`; photos from the `cafe-photos` bucket | DIS-7 | ⬜ |
| 2.7 | Profile load / save + avatar upload (≤ 5 MB, images only) | ACC-2, SEC-12 | ⬜ |
| 2.8 | Saved cafés, tasks, focus sessions, settings sync to their tables (optimistic, with rollback on error) | DIS-9, PRO-8, ACC-3 | ⬜ |
| 2.9 | Forms insert into `business_inquiries` / `issue_reports` | ACC-4 | ⬜ |
| 2.10 | Delete account → `delete_my_account()` + remove avatar files; Download my data → share a JSON export | AUTH-7, ACC-5 | ⬜ |
| 2.11 | Loading, empty and error states on every network screen | NFR-6 | ⬜ |
| 2.12 | Publish a first batch of complete cafés (`published = true`) and add Lalin's as the first `cafe_features` row | §5.3 | ⬜ |

## Phase 3 — Close the PRD gaps ⏱ 4–6 days · Owner: Claude + Denisse; Iris for art

| # | Task | TRD | Status |
| --- | --- | --- | --- |
| 3.1 | Borough filter on Map and Home | DIS-2 | ⬜ |
| 3.2 | Café card: hours per day, website, menu link, restroom alternative, Small Biz / POC badges, "(?)" explainers. Needs new `cafes` columns. | DIS-3, DIS-4 | ⬜ |
| 3.3 | "Notify our café scouts" suggestion form (reuse the website's `SuggestionForm` fields) | ACC-4 | ⬜ |
| 3.4 | To-do category tags (Work, Classwork, Homework, Start Up, Project) | PRO-4 | ⬜ |
| 3.5 | Interactive Eisenhower Matrix (or move to v2 per D4) | PRO-5 | ⛔ D4 |
| 3.6 | Pick up where you left off: persist the timer and current task across restarts | PRO-6 | ⬜ |
| 3.7 | Coffee-bean session tracker, streak, task-done celebration | PRO-7 | ⬜ |
| 3.8 | Choose a list when saving a café | — | ⬜ |
| 3.9 | Community Favorites by borough on Home | DIS-8 | ⬜ |
| 3.10 | Real map: MapLibre with the MapTiler key (already used on the website) + Iris's pin art. Needs a development build. | DIS-1 | ⬜ |
| 3.11 | Real Terms and Privacy Policy in the app (reuse the website's `/terms` and `/privacy` text, adapted for the app) | ACC-6 | ⬜ |

## Phase 4 — Website launch checklist ⏱ 1–2 days · Owner: Claude; Denisse approves

The 20-item pre-launch list. Items 7 (social preview image) and 19 (analytics) are already done.

| # | Item | Finding (Nov 12 audit of `work-and-brew-website`) | Status |
| --- | --- | --- | --- |
| 1 | Privacy policy page | `/privacy` exists (200 lines); review for app + Supabase + GA4 coverage | 🟡 review |
| 2 | Terms page | `/terms` exists (261 lines) | 🟡 review |
| 3 | Secrets off the frontend | Service role, Twilio and Brevo keys are server-only (`api/`). The browser has only the public anon and MapTiler keys. | ✅ |
| 4 | Force HTTPS | Vercel redirects HTTP → HTTPS; add HSTS + security headers in `vercel.json` | ⬜ |
| 5 | Cookie consent banner | GA4 loads before any consent; add a banner + Google Consent Mode | ⬜ |
| 6 | Meta titles + descriptions | One title for all pages; no description; add per-page titles and descriptions | ⬜ |
| 8 | Favicon | Present (`favicon-bear.png`, apple-touch-icon, manifest); add an SVG / ICO fallback | 🟡 |
| 9 | Sitemap + robots.txt | Missing; hide `/team`, `/ops`, `/dashboard`, `/settings` from search | ⬜ |
| 10 | Alt text on images | Audit every `<img>`; one decorative `alt=""` found | ⬜ |
| 11 | Compress images | `public/cafes` is **124 MB**, with 20 `.HEIC` files that Chrome, Firefox and Android can't display; convert to WebP/JPEG at web size | ⬜ |
| 12 | Page load speed | Measure with Lighthouse on mobile (target: Performance ≥ 80, LCP < 2.5 s) | ⬜ |
| 13 | Color contrast | Automated (axe) + manual check; fix anything under 4.5:1 | ⬜ |
| 14 | Mobile friendly | Check 320 px → desktop, no horizontal scroll | ⬜ |
| 15 | Custom 404 page | `NotFound` page exists; add `noindex`, and fix the wording ("This page is invalid.") | 🟡 |
| 16 | Fix broken links | Crawl all internal links and assets | ⬜ |
| 17 | Form validation | Waitlist validates email on the server; check Auth, Suggestion, Scout sign-up, For Owners, Settings | ⬜ |
| 18 | Spam protection | No bot protection on `/api/subscribe` or scout sign-up; add honeypot + Cloudflare Turnstile + rate limit | ⬜ |
| 20 | One clear call to action | Review Home: one primary CTA (join waitlist / download the app) | ⬜ |

## Phase 5 — Store readiness ⏱ start now, runs in parallel · Owner: Denisse; Claude for config

| # | Task | Status |
| --- | --- | --- |
| 5.1 | Apple Developer + Google Play Console accounts (D6) | ⬜ |
| 5.2 | `eas.json` with development / preview / production profiles; EAS secrets for the Supabase env vars | ⬜ |
| 5.3 | App icon (1024²), adaptive Android icon, splash, using the bear mark from the website | ⬜ |
| 5.4 | Development build for Apple sign-in + the real map | ⬜ |
| 5.5 | **Android closed test**: 12+ testers opted in for 14 continuous days (recruit 15–20) if personal account | ⬜ |
| 5.6 | iOS TestFlight build for the team | ⬜ |
| 5.7 | Apple App Privacy + Google Data safety forms (match TRD §5) | ⬜ |
| 5.8 | Web page for account-deletion requests on workandbrew.app (Google Play requirement) | ⬜ |
| 5.9 | Store listing: screenshots (iPhone 6.9", iPad 13", Android phone + tablet), description, keywords, support URL, privacy URL | ⬜ |
| 5.10 | Crash / error reporting and app analytics chosen and wired up (TRD NFR-7/8) | ⬜ |
| 5.11 | Submit iOS for review; request Google Play production access | ⬜ |

## Phase 6 — QA and launch · Owner: Christopher (QA), Denisse

| # | Task | Status |
| --- | --- | --- |
| 6.1 | Full regression on iPhone, iPad and Android (TESTING.md §4) | ⬜ |
| 6.2 | Security re-check after any database change (`tests/db/run.sh` + verify.sql) | ⬜ |
| 6.3 | Launch-day plan: monitoring, on-call, rollback (EAS Update for JS fixes) | ⬜ |
| 6.4 | Retrospective in Confluence after launch | ⬜ |

## v2 (Jan 4, 2027 per Roadmap)

Full catalog (~420 cafés), Eisenhower Matrix if deferred, specialty categories (open late, etc.), Café Rewards, and the café-owner portal (out of scope for v1).

---

## Security backlog (pinned Nov 12)

Carried from the security review; tracked in TRD §6.

| # | Item | Phase |
| --- | --- | --- |
| S1 | Run the lockdown script, with a backup first | 1 |
| S2 | Auth settings + admin 2FA | 1 |
| S3 | Bot protection on public forms | 4 (item 18) |
| S4 | App session in encrypted storage; upload limits | 2 |
| S5 | Move `growth_tokens` into Supabase Vault | after launch |
| S6 | Security Advisor after each migration | 1, 6 |
| S7 | Decide repo visibility (D7) | now |
| S8 | `/ops/:key` scout portal relies on a hidden URL; confirm the server checks team access too (it says it does: `ScoutPortal.jsx`, `api/hub.js`) | 4 |
