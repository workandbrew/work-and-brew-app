// Pomodoro-style focus timer shared across tabs: 4 sessions of 25 min with 5 min breaks.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from './AppState';

export const FOCUS_MIN = 25;
export const BREAK_MIN = 5;
export const SESSIONS = 4;

const FocusContext = createContext(null);

export function FocusProvider({ children }) {
  const { logSession } = useApp();
  const [phase, setPhase] = useState('focus'); // 'focus' | 'break'
  const [session, setSession] = useState(1);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(FOCUS_MIN * 60 * 1000);
  const [cafeId, setCafeId] = useState(null);
  const endsAt = useRef(null);
  const [, force] = useState(0);

  const duration = (phase === 'focus' ? FOCUS_MIN : BREAK_MIN) * 60 * 1000;
  const left = running && endsAt.current ? Math.max(0, endsAt.current - Date.now()) : remaining;

  const goTo = useCallback((nextPhase, nextSession, autoRun) => {
    const ms = (nextPhase === 'focus' ? FOCUS_MIN : BREAK_MIN) * 60 * 1000;
    setPhase(nextPhase);
    setSession(nextSession);
    setRemaining(ms);
    endsAt.current = autoRun ? Date.now() + ms : null;
    setRunning(!!autoRun);
  }, []);

  const finishPhase = useCallback((focusedMinutes = FOCUS_MIN) => {
    if (phase === 'focus') {
      if (focusedMinutes >= 1) logSession(focusedMinutes, cafeId);
      goTo('break', session, true);
    } else {
      goTo('focus', session >= SESSIONS ? 1 : session + 1, false);
    }
  }, [phase, session, cafeId, goTo, logSession]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      if (endsAt.current && Date.now() >= endsAt.current) finishPhase();
      else force((n) => n + 1);
    }, 250);
    return () => clearInterval(t);
  }, [running, finishPhase]);

  const api = useMemo(() => ({
    phase, session, running, left, duration, cafeId,
    progress: 1 - left / duration,
    start: (atCafeId) => {
      if (atCafeId !== undefined) setCafeId(atCafeId);
      if (running) return;
      endsAt.current = Date.now() + left;
      setRunning(true);
    },
    pause: () => {
      if (!running) return;
      setRemaining(Math.max(0, endsAt.current - Date.now()));
      endsAt.current = null;
      setRunning(false);
    },
    reset: () => {
      endsAt.current = null;
      setRunning(false);
      setRemaining(duration);
    },
    // "Hold the clock to skip to your break" (or skip the break).
    skip: () => finishPhase(phase === 'focus' ? Math.floor((duration - left) / 60000) : 0),
  }), [phase, session, running, left, duration, cafeId, finishPhase]);

  return <FocusContext.Provider value={api}>{children}</FocusContext.Provider>;
}

export function useFocusTimer() {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error('useFocusTimer must be used inside FocusProvider');
  return ctx;
}

export function formatClock(ms) {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
