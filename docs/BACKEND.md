# Backend plan (Supabase)

The UI is finished and runs on local sample data. Every screen reads and writes
through two places, so connecting Supabase won't touch the screens:

- `src/services/index.js`: auth, cafés, and form submissions (async functions with `// Supabase:` notes)
- `src/state/AppState.js`: profile, saved cafés, tasks, sessions, and settings (saved to the device for now)

## Proposed tables

| Table | Key columns | Used by |
|---|---|---|
| `profiles` | `id` (= auth.users.id), `name`, `about`, `intents text[]`, `school`, `borough`, `needs text[]`, `photo_url`, `member_no`, `created_at` | Profile, Edit profile |
| `cafes` | `id`, `name`, `neighborhood`, `borough`, `lat`, `lng`, `open_until`, `rating`, `scout_verified`, `amenities jsonb`, `tags text[]`, `scout_note`, `photos text[]` | Map, Search, Café detail, Home |
| `features` | `id`, `cafe_id`, `label`, `headline`, `space`, `pull_quote`, `order_notes`, `starts_on`, `ends_on` | Café of the Week |
| `saved_cafes` | `user_id`, `cafe_id`, `list` (`deep`/`weekends`/null), `created_at` | Saved, bookmark buttons |
| `tasks` | `id`, `user_id`, `text`, `quadrant`, `done`, `done_at` | Focus |
| `focus_sessions` | `id`, `user_id`, `cafe_id`, `minutes`, `started_at` | Wallet, Profile stats |
| `user_settings` | `user_id`, `notifications jsonb`, `privacy jsonb` | Notifications, Privacy |
| `business_inquiries` | `name`, `email`, `topic`, `message` | Business inquiries |
| `issue_reports` | `user_id`, `type`, `cafe`, `details` | Report an issue |
| `waitlist` | `user_id`, `kind` (`rewards`/`saved`) | Notify-me buttons |

Row Level Security: users read/write only their own rows. `cafes` and
`features` are public read. Forms are insert-only.

## Steps when we connect it

1. `npx expo install @supabase/supabase-js` and add `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` to `.env` (already git-ignored).
2. Create `src/lib/supabase.js` with the client (AsyncStorage for the auth session).
3. Swap each function in `src/services/index.js` for its Supabase call.
4. Load and save user data in `AppState.js` through Supabase (keep AsyncStorage as an offline cache).
5. Add email/password (or Apple / Google) sign-in screens behind the existing Log in / Create account buttons.
6. Upload profile and café photos to Supabase Storage. `CafePhoto` already shows `photos[]` URLs when present.
7. Account deletion runs in an Edge Function (it needs the service role key, which must never ship in the app).

The map is a stand-in (`src/components/MapStandIn.js`). Moving to MapTiler/MapLibre
needs a development build, because Expo Go doesn't include those native modules.
