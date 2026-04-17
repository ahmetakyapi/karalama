'use client';

import { useRef, useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  useInView,
} from 'framer-motion';
import { cn } from '@/lib/utils';

export const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (d: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: d },
  }),
};

export const scaleUp = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: (d: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE, delay: d },
  }),
};

export function TiltCard({
  children,
  className,
  glowColor = 'rgba(99,102,241,0.12)',
  tiltStrength = 6,
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  tiltStrength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const ry = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      rx.set(-((e.clientY - r.top) / r.height - 0.5) * tiltStrength);
      ry.set(((e.clientX - r.left) / r.width - 0.5) * tiltStrength);
      mx.set((e.clientX - r.left) / r.width);
      my.set((e.clientY - r.top) / r.height);
    },
    [rx, ry, mx, my, tiltStrength]
  );

  const onLeave = useCallback(() => {
    rx.set(0);
    ry.set(0);
    mx.set(0.5);
    my.set(0.5);
  }, [rx, ry, mx, my]);

  const shineX = useTransform(mx, [0, 1], ['0%', '100%']);
  const shineY = useTransform(my, [0, 1], ['0%', '100%']);
  const shine = useMotionTemplate`radial-gradient(360px circle at ${shineX} ${shineY}, ${glowColor}, transparent 70%)`;

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn('glass relative overflow-hidden', className)}
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: shine }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export function Counter({
  to,
  suffix = '',
  duration = 1.6,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {value.toLocaleString('tr-TR')}
      {suffix}
    </span>
  );
}

/** Ease-friendly loader placeholder used by dynamic() imports. */
export function SectionPlaceholder({ minHeight = 300 }: { minHeight?: number }) {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto max-w-6xl px-6 py-20"
      style={{ minHeight }}
    >
      <div className="glass rounded-3xl h-full w-full opacity-50 animate-pulse" />
    </div>
  );
}
