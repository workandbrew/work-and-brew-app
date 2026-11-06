// Data access layer. Every screen reads and writes through these functions, so
// connecting Supabase later means changing this file, not the screens.
// Each function is async on purpose to match the Supabase client.
import { CAFES, FEATURE } from '../data/cafes';

const wait = (ms = 150) => new Promise((r) => setTimeout(r, ms));

// --- Auth (Supabase: supabase.auth.signInWithPassword / signUp / signOut)
export async function signIn() {
  await wait();
  return { user: { id: 'local-user', email: null } };
}
export async function signUp() {
  await wait();
  return { user: { id: 'local-user', email: null } };
}
export async function signOut() {
  await wait(50);
}
export async function deleteAccount() {
  // Supabase: call an Edge Function that deletes the auth user and their rows.
  await wait();
}

// --- Cafés (Supabase: supabase.from('cafes').select('*'))
export function listCafes() {
  return CAFES;
}
export function getCafe(id) {
  return CAFES.find((c) => c.id === id) || null;
}
export function getFeature() {
  return FEATURE;
}

// --- Forms (Supabase: insert into business_inquiries / issue_reports / waitlist)
export async function submitInquiry(payload) {
  await wait(400);
  return { ok: true, payload };
}
export async function submitReport(payload) {
  await wait(400);
  return { ok: true, payload };
}
export async function requestDataExport() {
  await wait(300);
  return { ok: true };
}
