'use client';

import { useSyncExternalStore } from 'react';

/**
 * Tiny global flag flipped when the first-visit preloader lifts.
 * Hero entrances wait on it so they play *after* the curtain, not under it.
 */
let done = false;
const subs = new Set<() => void>();

export function markIntroDone() {
  if (done) return;
  done = true;
  subs.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

export function useIntroDone() {
  return useSyncExternalStore(
    subscribe,
    () => done,
    () => false
  );
}

/** Inline <head> script: decides before first paint whether the intro plays. */
export const INTRO_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;var rm=false;try{var st=JSON.parse(localStorage.getItem('karalama_settings')||'{}');rm=!!st.reduceMotion}catch(e){}if(sessionStorage.getItem('karalama_intro')||rm||location.pathname!=='/'||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){d.classList.add('intro-seen')}else{d.classList.add('is-loading')}}catch(e){document.documentElement.classList.add('intro-seen')}})();`;
