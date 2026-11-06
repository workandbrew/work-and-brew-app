// App-wide state, saved to the device with AsyncStorage.
// When Supabase is connected, profile/saved/tasks/prefs move to tables and this
// becomes a cache. Screens only use the hook below, so they won't change.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { listCafes } from '../services';

const KEY = 'workandbrew:state:v1';

let nextId = 100;
const uid = () => `t${Date.now().toString(36)}${(nextId++).toString(36)}`;

export const DEFAULT_STATE = {
  signedIn: false,
  profile: {
    name: 'Den',
    about: '[A line or two about you and how you like to work.]',
    intents: ['Study', 'Work remotely'],
    school: '',
    borough: 'Bronx',
    needs: ['Secure Wi-Fi', 'Outlets'],
    memberSince: 'March 2025',
    memberNo: '0001',
    photoUri: null,
  },
  saved: [{ cafeId: 'birch', list: 'deep' }],
  tasks: [
    { id: 't1', text: 'Wireframe review', quadrant: 'do', done: false },
    { id: 't2', text: 'Complete math homework set', quadrant: 'do', done: false },
    { id: 't3', text: 'Review lecture notes, chapter 4', quadrant: 'schedule', done: false },
    { id: 't4', text: 'Set up GitHub repo', quadrant: 'delegate', done: false },
    { id: 't5', text: 'Finalize wireframe screens', quadrant: 'do', done: true, doneAt: null },
  ],
  sessions: [], // { at, minutes, cafeId }
  visits: [{ cafeId: 'partners', at: null, minutes: 134 }],
  notifications: { push: true, email: true, digest: true, nearby: false },
  privacy: { location: true, shareStats: false, personalized: true },
  filters: [],
  waitlists: { saved: false, rewards: false },
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          setState((s) => ({ ...s, ...saved, profile: { ...s.profile, ...saved.profile } }));
        }
      } catch {}
      loaded.current = true;
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const patch = useCallback((fn) => setState((s) => ({ ...s, ...fn(s) })), []);

  const actions = useMemo(() => ({
    signIn: () => patch(() => ({ signedIn: true })),
    signOut: () => patch(() => ({ signedIn: false })),
    resetAll: () => setState({ ...DEFAULT_STATE }),

    updateProfile: (p) => patch((s) => ({ profile: { ...s.profile, ...p } })),

    isSaved: (cafeId) => state.saved.some((x) => x.cafeId === cafeId),
    toggleSaved: (cafeId, list = null) =>
      patch((s) => ({
        saved: s.saved.some((x) => x.cafeId === cafeId)
          ? s.saved.filter((x) => x.cafeId !== cafeId)
          : [{ cafeId, list }, ...s.saved],
      })),

    addTask: (text, quadrant = 'do') =>
      patch((s) => ({ tasks: [...s.tasks.filter((t) => !t.done), { id: uid(), text, quadrant, done: false }, ...s.tasks.filter((t) => t.done)] })),
    toggleTask: (id) =>
      patch((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done, doneAt: !t.done ? Date.now() : null } : t)) })),
    cycleQuadrant: (id) => {
      const order = ['do', 'schedule', 'delegate', 'drop'];
      patch((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, quadrant: order[(order.indexOf(t.quadrant) + 1) % 4] } : t)) }));
    },
    removeTask: (id) => patch((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

    logSession: (minutes, cafeId) =>
      patch((s) => ({
        sessions: [...s.sessions, { at: Date.now(), minutes, cafeId: cafeId || null }],
        visits: cafeId ? [{ cafeId, at: Date.now(), minutes }, ...s.visits] : s.visits,
      })),

    setNotification: (k, v) => patch((s) => ({ notifications: { ...s.notifications, [k]: v } })),
    setPrivacy: (k, v) => patch((s) => ({ privacy: { ...s.privacy, [k]: v } })),

    toggleFilter: (k) => patch((s) => ({ filters: s.filters.includes(k) ? s.filters.filter((x) => x !== k) : [...s.filters, k] })),
    resetFilters: () => patch(() => ({ filters: [] })),

    joinWaitlist: (k) => patch((s) => ({ waitlists: { ...s.waitlists, [k]: !s.waitlists[k] } })),
  }), [patch, state.saved]);

  const value = useMemo(() => ({ state, ready, ...actions }), [state, ready, actions]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

// Cafés that pass every active filter (and optional neighborhood / text query).
export function filterCafes(filters, { neighborhood, query } = {}) {
  const q = (query || '').trim().toLowerCase();
  return listCafes().filter(
    (c) =>
      filters.every((f) => c.tags.includes(f)) &&
      (!neighborhood || c.neighborhood === neighborhood) &&
      (!q || c.name.toLowerCase().includes(q) || c.neighborhood.toLowerCase().includes(q) || c.borough.toLowerCase().includes(q))
  );
}

// Stats shown on Profile and the Home wallet.
export function useStats() {
  const { state } = useApp();
  return useMemo(() => {
    const total = state.sessions.length;
    const minutes = state.sessions.reduce((a, s) => a + s.minutes, 0);
    const cafes = new Set(state.visits.map((v) => v.cafeId)).size;
    const weekStart = startOfWeek();
    const week = state.sessions.filter((s) => s.at >= weekStart);
    const weekMinutes = week.reduce((a, s) => a + s.minutes, 0);
    const tasksDoneThisWeek = state.tasks.filter((t) => t.done && t.doneAt && t.doneAt >= weekStart).length;
    return {
      sessions: total,
      cafesVisited: cafes,
      avgMinutes: total ? Math.round(minutes / total) : 0,
      weekSessions: week.length,
      weekHours: Math.round((weekMinutes / 60) * 10) / 10,
      tasksDoneThisWeek,
    };
  }, [state.sessions, state.visits, state.tasks]);
}

function startOfWeek() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d.getTime();
}

export function formatMinutes(m) {
  if (!m) return '0m';
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? `${h}h${r ? ` ${r}m` : ''}` : `${r}m`;
}
