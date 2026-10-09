'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useSettingsStore } from '@/stores/settingsStore';

export const EXPO = [0.16, 1, 0.3, 1] as const;
export const CURTAIN = [0.76, 0, 0.24, 1] as const;

/** True when either the OS or the in-app setting asks for less motion. */
export function useLowMotion() {
  const system = useReducedMotion();
  const setting = useSettingsStore((s) => s.reduceMotion);
  return !!system || setting;
}

export function useMediaQuery(query: string, initial = false) {
  const [match, setMatch] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return match;
}

/** Game routes keep native scrolling/cursor so canvas + chat stay untouched. */
export function isGameRoute(pathname: string | null) {
  return !!pathname && pathname.startsWith('/oda/') && pathname !== '/oda/olustur';
}
