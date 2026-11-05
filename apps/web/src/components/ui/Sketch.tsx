'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/**
 * Invisible span that writes the pointer position (--mx/--my, px) and a
 * --lit flag onto its parent, batched into one frame. Fine pointers only:
 * on touch there is no hover light to chase.
 */
export function PointerLight() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host || !window.matchMedia('(pointer: fine)').matches) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      raf = 0;
      host.style.setProperty('--mx', `${x}px`);
      host.style.setProperty('--my', `${y}px`);
    };
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const enter = () => host.style.setProperty('--lit', '1');
    const leave = () => host.style.setProperty('--lit', '0');
    host.addEventListener('pointermove', move, { passive: true });
    host.addEventListener('pointerenter', enter);
    host.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerenter', enter);
      host.removeEventListener('pointerleave', leave);
    };
  }, []);
  return <span ref={ref} hidden />;
}

/** A strip of masking tape. Position it with className (absolute). */
export function Tape({ className, style, dark }: { className?: string; style?: CSSProperties; dark?: boolean }) {
  return <span aria-hidden="true" className={cn('tape', dark && 'tape-dark', className)} style={style} />;
}

const DIVIDERS = {
  wave: 'M2 22 C 120 4, 220 40, 340 20 S 560 4, 680 22 S 900 38, 1020 18 S 1180 8, 1198 20',
  loop: 'M2 24 C 160 24, 260 8, 380 20 C 470 30, 470 2, 430 6 C 392 10, 420 36, 520 30 C 700 18, 900 30, 1198 16',
  zig: 'M2 26 L 60 10 L 118 28 L 176 8 L 236 26 L 296 10 L 356 28 L 416 8 L 476 26 L 536 10 L 596 28 L 656 8 L 716 26 L 776 10 L 836 28 L 896 8 L 956 26 L 1016 10 L 1076 28 L 1136 8 L 1198 22',
} as const;

/**
 * Hand-drawn line between sections. It "draws" left→right as it scrolls
 * into view (clip-path on a scroll timeline; static elsewhere).
 */
export function SketchDivider({
  variant = 'wave',
  className,
  color = 'var(--marker)',
  label,
}: {
  variant?: keyof typeof DIVIDERS;
  className?: string;
  color?: string;
  label?: string;
}) {
  return (
    <div aria-hidden="true" className={cn('relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-6', className)}>
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="sketch-divider draw-on-scroll h-6 sm:h-8" fill="none">
        <path d={DIVIDERS[variant]} stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" opacity="0.7" />
      </svg>
      {label && (
        <span className="absolute -top-7 right-8 rotate-[-4deg] font-hand text-xl text-slate-400 rise-on-scroll">{label}</span>
      )}
    </div>
  );
}

/* ---------- Doodle glyphs (viewBox 0 0 48 48, stroked) ---------- */
export const GLYPHS = {
  star: 'M24 4 L28 18 L43 19 L31 28 L35 43 L24 34 L13 43 L17 28 L5 19 L20 18 Z',
  spiral: 'M24 24 C 24 20, 30 20, 30 25 C 30 31, 20 32, 18 25 C 16 17, 27 12, 34 18 C 42 26, 36 40, 24 40 C 12 40, 6 30, 9 20',
  heart: 'M24 40 C 10 30, 4 22, 8 14 C 12 7, 21 8, 24 15 C 27 8, 36 7, 40 14 C 44 22, 38 30, 24 40 Z',
  arrow: 'M6 36 C 16 18, 28 12, 42 12 M42 12 L32 6 M42 12 L34 21',
  squiggle: 'M4 26 C 10 14, 14 38, 20 26 S 30 14, 36 26 S 44 34, 46 24',
  cloud: 'M12 36 C 4 36, 4 26, 12 25 C 11 16, 22 12, 26 19 C 30 12, 42 14, 40 24 C 47 25, 46 36, 38 36 Z',
  bolt: 'M28 4 L12 28 L24 28 L18 44 L38 18 L26 18 Z',
  pencil: 'M8 40 L32 16 L38 22 L14 46 L6 46 Z M30 18 L36 24 M34 12 L40 6 L44 10 L38 16',
  smile: 'M24 6 C 36 6, 42 14, 42 24 C 42 36, 34 42, 24 42 C 12 42, 6 34, 6 24 C 6 12, 14 6, 24 6 Z M17 20 L17 22 M31 20 L31 22 M16 30 C 20 35, 28 35, 32 30',
} as const;

export type GlyphName = keyof typeof GLYPHS;

export function Glyph({
  name,
  className,
  strokeWidth = 2.4,
  style,
}: {
  name: GlyphName;
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className} style={style}>
      <path d={GLYPHS[name]} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Hand-drawn underline that draws itself once (CSS, no JS timeline). */
export function ScribbleUnderline({ className, delay = 0, color = 'var(--marker)' }: { className?: string; delay?: number; color?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 14"
      preserveAspectRatio="none"
      fill="none"
      className={cn('draw-in pointer-events-none absolute -bottom-2 left-0 h-3 w-full', className)}
      style={{ ['--d' as string]: `${delay}s` }}
    >
      <path d="M 4 8 Q 60 1 110 8 T 216 6" stroke={color} strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
