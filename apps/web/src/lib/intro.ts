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

/**
 * Inline <head> script: decides before first paint whether the intro plays,
 * then follows the CSS preloader's own `animationend` (not a JS timer) to
 * unlock scrolling — so it stays in sync even when the page loads slowly and
 * never depends on hydration. A timeout is the last-resort failsafe.
 */
export const INTRO_BOOT_SCRIPT = `(function(){var d=document.documentElement;try{var rm=false;try{var st=JSON.parse(localStorage.getItem('karalama_settings')||'{}');rm=!!st.reduceMotion}catch(e){}if(sessionStorage.getItem('karalama_intro')||rm||location.pathname!=='/'||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){d.classList.add('intro-seen');window.__introDone=true;return}try{sessionStorage.setItem('karalama_intro','1')}catch(e){}d.classList.add('intro-play','is-loading');var done=function(){if(window.__introDone)return;window.__introDone=true;d.classList.remove('is-loading');window.dispatchEvent(new Event('karalama:intro'));setTimeout(function(){d.classList.remove('intro-play');d.classList.add('intro-seen')},4000)};document.addEventListener('animationend',function(e){if(e.animationName==='pre-content-out')done()},true);setTimeout(done,6000)}catch(e){d.classList.add('intro-seen');window.__introDone=true}})();`;
