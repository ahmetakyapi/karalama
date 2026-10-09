'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
  type MotionValue,
} from 'framer-motion';
import { cn } from '@/lib/utils';
import { EXPO } from './hooks';

/* ============================================================
   MaskText — words rise out of an invisible mask, staggered
   ============================================================ */
type MaskPart = string | { text: string; className?: string };

export function MaskText({
  parts,
  as: Tag = 'span',
  className,
  wordClassName,
  play,
  delay = 0,
  stagger = 0.06,
  duration = 1,
  once = true,
  id,
}: {
  id?: string;
  parts: MaskPart[];
  as?: ElementType;
  className?: string;
  wordClassName?: string;
  /** Force play state; defaults to "when in view" */
  play?: boolean;
  delay?: number;
  stagger?: number;
  duration?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, margin: '0px 0px -12% 0px' });
  const show = play ?? inView;

  const words: { text: string; className?: string }[] = [];
  for (const p of parts) {
    const part = typeof p === 'string' ? { text: p } : p;
    if (part.text === '\n') {
      words.push({ text: '\n' });
      continue;
    }
    for (const w of part.text.split(' ')) if (w) words.push({ text: w, className: part.className });
  }

  let idx = 0;
  return (
    <Tag ref={ref} id={id} className={className}>
      <span className="sr-only">{words.map((w) => (w.text === '\n' ? ' ' : w.text)).join(' ')}</span>
      <span aria-hidden="true">
        {words.map((w, i) => {
          if (w.text === '\n') return <br key={`br-${i}`} />;
          const d = delay + idx++ * stagger;
          return (
            <span key={i} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
              <motion.span
                className={cn('inline-block will-change-transform', wordClassName, w.className)}
                initial={{ y: '110%', rotate: 6 }}
                animate={show ? { y: '0%', rotate: 0 } : { y: '110%', rotate: 6 }}
                transition={{ duration, ease: EXPO, delay: show ? d : 0 }}
              >
                {w.text}
              </motion.span>
              {' '}
            </span>
          );
        })}
      </span>
    </Tag>
  );
}

/* ============================================================
   ScrollWords — scroll-scrubbed word-by-word opacity reveal
   ============================================================ */
function ScrubWord({
  progress,
  range,
  children,
  className,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  children: ReactNode;
  className?: string;
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [8, 0]);
  return (
    <motion.span style={{ opacity, y }} className={cn('inline-block', className)}>
      {children}
    </motion.span>
  );
}

export function ScrollWords({
  text,
  highlight = [],
  className,
}: {
  text: string;
  /** Words (lowercase match) that get the marker colour */
  highlight?: string[];
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const words = text.split(' ');
  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => {
          const start = i / words.length;
          const hl = highlight.includes(w.toLocaleLowerCase('tr-TR').replace(/[.,;!?]/g, ''));
          return (
            <span key={i}>
              <ScrubWord
                progress={scrollYProgress}
                range={[start, start + 1 / words.length]}
                className={hl ? 'text-[var(--marker)] font-hand text-[1.18em] leading-none' : undefined}
              >
                {w}
              </ScrubWord>{' '}
            </span>
          );
        })}
      </span>
    </p>
  );
}

/* ============================================================
   Magnetic — element leans toward the pointer
   ============================================================ */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 15, mass: 0.4 });
  const y = useSpring(0, { stiffness: 200, damping: 15, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={cn('inline-block', className)}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   RollText — letters roll up on hover of a `.roll-host` parent
   ============================================================ */
export function RollText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn('roll', className)}>
      <span className="sr-only">{text}</span>
      {text.split('').map((ch, i) => (
        <span key={i} aria-hidden="true" style={{ '--i': i } as CSSProperties}>
          {ch}
        </span>
      ))}
    </span>
  );
}

/* ============================================================
   VelocityMarquee — base drift + scroll-velocity boost & skew
   ============================================================ */
export function VelocityMarquee({
  children,
  baseVelocity = 3,
  className,
}: {
  children: ReactNode;
  baseVelocity?: number;
  className?: string;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [-1000, 0, 1000], [-4, 0, 4], { clamp: false });
  const skewX = useTransform(smooth, [-2000, 0, 2000], [8, 0, -8]);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    let move = direction.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    move += direction.current * move * Math.abs(f);
    baseX.set(baseX.get() + move);
  });

  return (
    <div className={cn('overflow-hidden whitespace-nowrap', className)}>
      <motion.div className="flex w-max flex-nowrap" style={{ x, skewX }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================================
   Parallax — translate on scroll relative to its own position
   ============================================================ */
export function Parallax({
  children,
  offset = 80,
  className,
}: {
  children: ReactNode;
  offset?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/* ============================================================
   SectionHeading — editorial "(02) — Label" + display title
   ============================================================ */
export function SectionHeading({
  index,
  eyebrow,
  title,
  desc,
  align = 'left',
  stacked = false,
  id,
}: {
  stacked?: boolean;
  index: string;
  eyebrow: string;
  title: MaskPart[];
  desc?: string;
  align?: 'left' | 'center';
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  return (
    <div
      ref={ref}
      className={cn(
        'mb-14 sm:mb-20 flex flex-col gap-6',
        align === 'center'
          ? 'items-center text-center'
          : !stacked && 'md:flex-row md:items-end md:justify-between'
      )}
    >
      <div className={cn(align === 'center' && 'flex flex-col items-center')}>
        <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-slate-500">
          <span className="text-[var(--marker)]">({index})</span>
          <motion.span
            className="h-px w-10 origin-left bg-slate-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: inView ? 1 : 0 }}
            transition={{ duration: 0.9, ease: EXPO, delay: 0.1 }}
          />
          <span>{eyebrow}</span>
        </div>
        <MaskText
          as="h2"
          id={id}
          parts={title}
          play={inView}
          className="font-display text-[44px] sm:text-6xl lg:text-7xl font-extrabold leading-[0.95] tracking-[-0.045em] text-slate-50"
        />
      </div>
      {desc && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, ease: EXPO, delay: 0.35 }}
          className={cn('max-w-sm text-base leading-relaxed text-slate-400', align === 'center' && 'mx-auto')}
        >
          {desc}
        </motion.p>
      )}
    </div>
  );
}

/* ============================================================
   InView — mounts children only once visible (replays scenes)
   ============================================================ */
export function WhenVisible({
  children,
  className,
  amount = 0.35,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount });
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inView) setSeen(true);
  }, [inView]);
  return (
    <div ref={ref} className={className}>
      {seen ? children : null}
    </div>
  );
}
