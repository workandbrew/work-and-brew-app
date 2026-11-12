# Work & Brew — Technical Requirements Document (TRD)

| Field | Detail |
| --- | --- |
| Product | Work & Brew mobile app (iOS, iPadOS, Android) |
| Owner | Denisse Medina Flores (Founder / PM) |
| Backend owner | David Torres (Cofounder / Backend) |
| Status | UI built; backend connection in progress |
| Last updated | 2026-11-12 |
| Related | Confluence: *PRD - App (v1)*, *Roadmap*, *Cafe Listing Checklist*, design reviews · Repo: [APP_FLOW.md](APP_FLOW.md), [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md), [TESTING.md](TESTING.md) |

The PRD says **what** we build and **why**. This TRD says **how**: the stack, architecture, data, security and the requirements each feature must meet.
Status labels: **Built** (in the app now) · **Partial** · **Gap** (in the PRD, not built) · **Planned** (not in the PRD, agreed for later).

---

## 1. Scope

The v1 app combines a scout-verified directory of work-friendly NYC cafés with an ADHD-friendly productivity toolkit (Pomodoro timer, tagged to-dos, Eisenhower Matrix). It shares one Supabase project with the team hub and the website at workandbrew.app.

Out of scope for v1, per the PRD: user photos and reviews, subscriptions and in-app payments, specialty café categories (e.g. "open late", "mom friendly"), a café-owner portal, live café updates, bookings, and AI-generated listings.

## 2. Platforms and devices

| Requirement | Detail |
| --- | --- |
| iOS / iPadOS | iPhone SE (320 pt wide) through iPad Pro, portrait and landscape (`supportsTablet: true`, `orientation: default`) |
| Android | Phones and tablets. Same codebase. |
| Web | Builds for quick checks and tests only. Not a shipping target. |
| Layout | Phones use full width with a 16–20 pt gutter; tablets center content in a 680 pt column (`src/theme/useLayout.js`). No horizontal scrolling at any size. |
| Theme | Dark "Spotlight" theme from the wireframe kit (`src/theme/index.js`). |

## 3. Tech stack

| Layer | Choice (exact versions in `package.json`) |
| --- | --- |
| Framework | Expo SDK 58, React Native 0.88, React 19.3, **JavaScript (no TypeScript)** |
| Navigation | Expo Router 58: file-based routes in `src/app/` |
| UI | React Native core + `react-native-svg` (icons, illustrations, map stand-in) |
| Fonts | Playfair Display (display), Inter (UI), Times New Roman / system serif (nav labels) |
| Local storage | `@react-native-async-storage/async-storage` (moving the auth session to the encrypted keychain: see §7) |
| Backend | Supabase: Postgres, Auth, Storage, via `@supabase/supabase-js` 2.x |
| Auth helpers | `expo-web-browser` (Google / Apple sign-in), `expo-crypto` (IDs), `react-native-url-polyfill` |
| Media | `expo-image-picker` (profile photo) |
| Builds and releases | EAS Build / Submit (cloud). The `ios/` and `android/` folders are generated, never hand-edited. |

**Expo Go vs development build.** Everything in the app today runs in Expo Go. A real map (MapLibre / MapTiler) and native Sign in with Apple need a development build. See §9.

## 4. Architecture

```
src/app/            Screens (Expo Router). (tabs)/ = Explore, Map, Focus, Saved, Profile; each tab is its own stack.
src/components/     Shared UI: NavBar, ui.js (buttons, fields, rows), CafePhoto, MapStandIn, Sheet, Icon…
src/theme/          Design tokens + useLayout (responsive sizing)
src/state/          AppState (user data, persisted) and FocusTimer (Pomodoro engine)
src/services/       Data access. The ONLY layer that talks to Supabase.
src/data/           Sample data + bundled test images (local demo mode)
supabase/           SQL: inventory queries, migrations, verify.sql
tests/              Database security tests + browser click-through tests
```

Rules:
1. Screens never call Supabase directly. They go through `src/services`, so the backend can change without touching screens.
2. Without Supabase settings (`EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`), the app runs in **local demo mode** on sample data. With them, it uses live data.
3. Updates are optimistic: the screen changes right away and the write goes to Supabase in the background. A failed write must show an error and roll back (§8, NFR-6).

## 5. Data model (Supabase)

The project is shared with the team hub and website (`workandbrew/work-and-brew-website`). Hub tables (`scouts`, `sms_*`, `growth_*`, `events`, `signup_requests`, `team_access`, `hub_admins`, `current_works`) are **not touched by the app**.

### 5.1 Existing tables the app uses

| Table | App use | Change made by `supabase/migrations/20261112_01_security_and_app.sql` |
| --- | --- | --- |
| `cafes` (581 rows) | Source of café listings | Adds `published`, `neighborhood`, `open_until`, `rating`, `highlights[]`, `app_tags[]`, `laptops_note`, `vibe`, `scout_note`, `photos[]`. Existing columns unchanged. |
| `profiles` (9 rows) | Member profile | Adds `about`, `intents[]`, `school`, `borough`, `needs[]`, `photo_path`, `member_no` |

### 5.2 New objects

| Object | Purpose | Key columns |
| --- | --- | --- |
| `app_cafes` (view) | The only way app users read cafés: published rows and safe columns only | id, name, address, borough, neighborhood, lat/long, wifi/secured/outlets/hot_food/restroom/seats, open_until, rating, highlights, photos, derived `tags[]` |
| `cafe_features` | Café of the Week | cafe_id, label, headline, space, pull_quote, order_notes, hero/header/order photos, starts_on, ends_on |
| `saved_cafes` | Saved list | user_id, cafe_id, list (`deep` / `weekends` / null) |
| `tasks` | To-dos | id, user_id, text (1–300 chars), quadrant (`do` / `schedule` / `delegate` / `drop`), done, done_at |
| `focus_sessions` | Completed Pomodoros | user_id, cafe_id, minutes (1–600), started_at |
| `user_settings` | Notification, privacy, waitlist and filter settings | user_id, notifications jsonb, privacy jsonb, waitlists jsonb, filters[] |
| `business_inquiries` | "For café owners" form | name, email, topic, message (length-checked) |
| `issue_reports` | "Report an issue" form | type, cafe, details |
| Storage `avatars` (private) | Profile photos, at `{user_id}/…` | |
| Storage `cafe-photos` (private) | Café photos, uploaded by the team | |
| `delete_my_account()` | In-app account deletion (blocked for team accounts) | |

### 5.3 Derived café tags (in `app_cafes`)

| Tag | Rule | Matches checklist |
| --- | --- | --- |
| `wifi` | `wifi AND secured` | Wi-Fi security (WPA2/WPA3) |
| `outlets` | `outlets` | Outlets |
| `seats8` | `seats IN ('Many','Ample')` | Seating: Many 8–12, Ample 12+ |
| `restroom` | `restroom` | Restroom |
| `hotFood` | `hot_food` | Menu: hot food |
| `noLimit` | `time_restrict = false` | Laptop limits |
| `smallBiz` | `source = 'DB small_biz'` | What makes it unique (**to replace with the classification tags**: see Open questions) |
| others | `app_tags[]` (set by the team) | quiet, light, calm, lively, laptopsLate, drinks, pocOwned |

**Publishing rule.** A café appears in the app only when `published = true`. Team admins (Denisse, Armando, David) set it once every field in the *Cafe Listing Checklist* is filled in and approved.

## 6. Security requirements

| ID | Requirement | Status |
| --- | --- | --- |
| SEC-1 | Logged-out visitors can read nothing: no cafés, profiles or user data | Script ready, tested (30/30) |
| SEC-2 | App users read only published cafés, through `app_cafes`. Internal columns (`assigned_to`, `scout_name`, `notes`, `status`, `source`) are never exposed. | Script ready, tested |
| SEC-3 | Only team members (confirmed email listed in `team_access` / `hub_admins`) can add, edit or delete cafés | Script ready, tested |
| SEC-4 | Every row of personal data (profile, saved, tasks, sessions, settings, avatar) is readable and writable only by its owner | Script ready, tested |
| SEC-5 | Profile emails are private. The team can read profiles for hub use. | Script ready, tested |
| SEC-6 | Forms are submit-only for users; only the team can read submissions | Script ready, tested |
| SEC-7 | Team status requires a **confirmed** email (blocks spoofed sign-ups) | Script ready, tested |
| SEC-8 | The `service_role` / secret key is never in app or browser code; only server-side or in Edge Function secrets | App: verified. Website / hub (`work-and-brew-website`): verified Nov 12. Only `api/` (Vercel server functions) reads it. |
| SEC-9 | The app ships only the public anon / publishable key, from `.env` (git-ignored) | Planned |
| SEC-10 | Auth sessions stored in the device's encrypted keychain (`expo-secure-store`), not plain AsyncStorage | Planned |
| SEC-11 | Auth settings: Confirm email on; password ≥ 8 characters; leaked-password check if the plan allows; 2FA for hub admins; exact redirect URLs | To do (dashboard) |
| SEC-12 | Uploads capped at about 5 MB, images only | Planned |
| SEC-13 | Bot protection on public forms (scout sign-up → `signup_requests`, waitlist → `/api/subscribe`), checked server-side | To do (website) |
| SEC-14 | Social API tokens (`growth_tokens`) moved to Supabase Vault | To do (hub) |
| SEC-15 | Supabase Security Advisor run after every migration. `app_cafes` "security definer view" is intentional. | To do |

## 7. Authentication requirements

| ID | Requirement | Status |
| --- | --- | --- |
| AUTH-1 | Email + password sign-up and log-in | **Gap**: UI buttons only; sign-in is local |
| AUTH-2 | Password reset by email (PRD Must Have) | **Gap** |
| AUTH-3 | Google sign-in. Already used by some accounts in the project. | **Gap** in app |
| AUTH-4 | **Sign in with Apple.** App Store guideline 4.8: an iOS app that offers Google sign-in must also offer an equivalent privacy-focused login (shares only name and email, lets people hide their email). Sign in with Apple is the standard way to meet it. Needs an Apple Developer account and a development build. | **Gap**: needed for iOS release if Google sign-in ships |
| AUTH-5 | Stay signed in; auto-refresh the token while the app is open; log out clears local user data | **Gap** |
| AUTH-6 | Sign-up stores `name` and `signup_source = 'app'` in the profile (trigger fixed in the script) | Script ready |
| AUTH-7 | In-app account deletion (Apple + Google requirement) **plus a web page for deletion requests** (Google Play requirement) | App: Partial (local only). Web page: **Gap** |
| AUTH-8 | Redirect URLs: `workandbrew://**` (builds), `exp://**` (Expo Go, development only), the web URL | To do (dashboard) |

## 8. Functional requirements

### 8.1 Discovery

| ID | Requirement | PRD | Status |
| --- | --- | --- | --- |
| DIS-1 | Interactive NYC map with tap-a-pin → café card | Must | **Partial**: drawn stand-in map. A real map (MapTiler / MapLibre, Iris's custom pin) needs a dev build. |
| DIS-2 | Borough filter on map and home | Must | **Gap**: the app has neighborhood chips, not borough |
| DIS-3 | Café card: wifi + security, outlets, seating bucket, restroom (+ nearby alternative), laptop rules / time limit, noise and atmosphere, menu / hot food, **hours per day**, website, menu link, Small Biz / POC-owned tags, photos, scout note | Must | **Partial**: missing hours per day, website and menu links, restroom alternative, Small Biz badge on card |
| DIS-4 | "(?)" explainer for how seats and wifi security are judged | Sprint 1 | **Gap** |
| DIS-5 | Filters: Work / Vibe / Rules / Food groups + quick chips | Design review | Built (chips differ from review: see Open questions) |
| DIS-6 | Search by café or neighborhood | — | Built |
| DIS-7 | Café of the Week article from `cafe_features` | Must | Built (local); needs backend |
| DIS-8 | Community Favorites by borough on Home | Sprint 2 | **Gap** (Home uses the wallet design David picked) |
| DIS-9 | Save cafés into lists (All / Deep focus / Weekends) | — | Built (local); needs backend |
| DIS-10 | Directions open Apple Maps / Google Maps by name + address | — | Built |

### 8.2 Productivity

| ID | Requirement | PRD | Status |
| --- | --- | --- | --- |
| PRO-1 | Pomodoro timer tied to the current task: 4 × 25 min, 5 min breaks, pause/reset, hold to skip | Must | Built |
| PRO-2 | Timer keeps running across tabs | — | Built |
| PRO-3 | Brain dump quick capture | Design review | Built |
| PRO-4 | To-dos with **category tags** (Work, Classwork, Homework, Start Up, Project) | Must | **Gap**: priority dots only |
| PRO-5 | **Interactive Eisenhower Matrix** (2×2, move tasks between quadrants) | Must (fast-follow to v2 allowed by decision log) | **Partial**: counts + cycle priority |
| PRO-6 | Pick up where you left off after the app restarts | Should | **Gap**: timer resets on restart |
| PRO-7 | Coffee-bean session tracker, streak, task-done celebration | Design review | **Partial**: session dots only |
| PRO-8 | Completed sessions logged to `focus_sessions` (feeds the wallet and profile stats) | — | Built (local); needs backend |

### 8.3 Account and profile

| ID | Requirement | PRD | Status |
| --- | --- | --- | --- |
| ACC-1 | Profile: member card, stats, about, intents, Café Rewards teaser | Must | Built |
| ACC-2 | Edit profile with photo upload to the private `avatars` bucket | Must | Built (local photo); upload planned |
| ACC-3 | Notification and privacy settings saved to `user_settings` | Must | Built (local) |
| ACC-4 | Forms: For Café Owners ✓, App Issues ✓, **Notify Our Cafe Scouts** (suggest a café) | Must | **Partial**: scout suggestion form missing |
| ACC-5 | Download my data (export the user's rows) | — | Partial (placeholder message) |
| ACC-6 | Terms and Privacy Policy, real text | Must (store requirement) | **Gap**: placeholders |

## 9. Non-functional requirements

| ID | Requirement |
| --- | --- |
| NFR-1 | **Responsive:** iPhone SE → iPad landscape, no horizontal overflow, no truncated primary actions (checked by `tests/e2e/sizes.js`) |
| NFR-2 | **Performance:** cold start to first screen under 3 s on a mid-range phone; café list from Supabase under 1 s on 4G |
| NFR-3 | **Accessibility:** every control has an accessible label and role; tap targets ≥ 44 pt; text contrast ≥ 4.5:1 on the dark theme |
| NFR-4 | **Offline:** last-loaded cafés and the user's own data still show offline; writes made offline sync later |
| NFR-5 | **Privacy:** collect only what features need; location only while the app is in use, and only if Privacy → Location is on |
| NFR-6 | **Errors:** every network call has loading, empty and error states; no silent failures (Sprint 3 requirement) |
| NFR-7 | **Observability:** crash and error reporting in production builds (tool to be chosen) |
| NFR-8 | **Analytics:** measure Weekly Active Users (PRD north star: 100 in 30 days), downloads, productivity-tool usage, week-1 retention. Tool to be chosen; must respect the privacy settings. |

## 10. Environments and configuration

| Variable | Where | Notes |
| --- | --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | `.env` (git-ignored) and EAS secrets | Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `.env` and EAS secrets | Public anon / publishable key **only** |
| App identifiers | `app.json` | iOS `com.workandbrew.app`, Android `com.workandbrew.app`, scheme `workandbrew` |

## 11. Store requirements (iOS and Android)

- Apple Developer and Google Play Console accounts. A **Google Play organization** account skips the 14-day / 12-tester closed test; a personal account does not.
- Sign in with Apple (AUTH-4); in-app account deletion; web deletion page (AUTH-7).
- Real Privacy Policy and Terms, linked in the app and the store listings.
- Apple App Privacy ("nutrition label") and Google Play Data safety forms, matching what the app actually collects (§5).
- App icon, splash screen, screenshots (iPhone 6.9", iPad 13", Android phone and tablet), description, keywords.
- Location and photo-library permission prompts with clear reasons.

## 12. Open questions

1. **Launch date:** sprint pages and the decision log say Nov 22 (Founding Pop Up); App PRD v1.2 says Nov 30. Which is current?
2. **Tabs:** the PRD says 4 tabs (Home, Cafe Finder, Productivity, Profile); the approved wireframe has 5 (Explore, Map, Focus, Saved, Profile). Confirm the 5-tab design is final.
3. **Quick filter chips:** the café map review lists Wi-Fi Guard, Outlets: Plenty, Seats: Many+, Restroom, Laptops after 6 PM. The wireframe uses Quiet, Outlets, Open late, Hot food, Big tables. "Open late" is a v1 out-of-scope category per the PRD.
4. **Small Biz tag:** use the *Cafe Classification Guide* fields (Small Business / Big Chain / Small Business Friendly). Where are they stored? They aren't in `cafes` today.
5. **Hours:** the checklist needs hours per day; `cafes` has no hours column yet.
6. ~~**Hub:**~~ Answered Nov 12. The hub and website are `workandbrew/work-and-brew-website` (Vite + React on Vercel). The service role key is server-only, and the public map reads a Google Sheet feed rather than Supabase, so it isn't affected by SEC-1.
9. **Repo visibility:** both GitHub repos are **public**. That conflicts with "All rights reserved" in the README and exposes test photos and internal SQL. Make them private?
7. **Google Play account type:** personal or organization (affects the closed test)?
8. **Analytics and crash reporting tools** (NFR-7, NFR-8).
