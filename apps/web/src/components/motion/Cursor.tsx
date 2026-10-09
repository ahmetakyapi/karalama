'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { isGameRoute, useLowMotion, useMediaQuery } from './hooks';

type Mode = 'default' | 'hover' | 'text' | 'label';

const INTERACTIVE = 'a, button, [role="button"], [role="radio"], summary, label[for], select, [data-cursor]';

/**
 * Trailing ring + precise dot. Grows over interactive elements and can show a
 * label via `data-cursor="Oyna"`. Native cursor stays visible for accessibility.
 */
export function Cursor() {
  const pathname = usePathname();
  const lowMotion = useLowMotion();
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const enabled = finePointer && !lowMotion && !isGameRoute(pathname);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 });

  const [mode, setMode] = useState<Mode>('default');
  const [label, setLabel] = useState('');
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const over = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest) return;
      if (t.closest('input[type="text"], input:not([type]), textarea, [contenteditable="true"]')) {
        setMode('text');
        return;
      }
      const hit = t.closest<HTMLElement>(INTERACTIVE);
      if (!hit) {
        setMode('default');
        return;
      }
      const l = hit.dataset.cursor;
      if (l) {
        setLabel(l);
        setMode('label');
      } else {
        setMode('hover');
      }
    };
    const leave = () => setVisible(false);
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
    };
  }, [enabled, x, y]);

  // Reset hover state between pages
  useEffect(() => {
    setMode('default');
  }, [pathname]);

  if (!enabled) return null;

  const size = mode === 'label' ? 88 : mode === 'hover' ? 54 : mode === 'text' ? 6 : 34;

  return (
    <div className="cursor-layer pointer-events-none fixed inset-0 z-[180]" aria-hidden="true">
      <motion.div
        className="absolute left-0 top-0 rounded-full border"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: size,
          height: size,
          opacity: visible ? 1 : 0,
          scale: pressed ? 0.82 : 1,
          backgroundColor: mode === 'label' ? 'rgba(200,245,96,1)' : mode === 'hover' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0)',
          borderColor: mode === 'label' ? 'rgba(200,245,96,0)' : 'rgba(255,255,255,0.55)',
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        <AnimatePresence>
          {mode === 'label' && (
            <motion.span
              key={label}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 flex items-center justify-center text-[11px] font-bold uppercase tracking-[0.12em] text-[#04070d]"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-[var(--marker)]"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: visible && mode !== 'label' && mode !== 'text' ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      />
    </div>
  );
}
