'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { MotionConfig, motion, useScroll, useSpring } from 'framer-motion';
import { useSettingsStore } from '@/stores/settingsStore';
import { SmoothScroll } from './SmoothScroll';
import { TransitionProvider } from './PageTransition';
import { IntroClock } from './IntroClock';
import { Cursor } from './Cursor';
import { isGameRoute } from './hooks';

function ScrollProgress() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  if (isGameRoute(pathname)) return null;
  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-indigo-500 via-cyan-400 to-[#c8f560]"
      style={{ scaleX }}
    />
  );
}

function Grain() {
  const pathname = usePathname();
  if (isGameRoute(pathname)) return null;
  return <div className="grain" aria-hidden="true" />;
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
      <SmoothScroll>
        <TransitionProvider>
          {children}
          <ScrollProgress />
          <Cursor />
          <IntroClock />
          <Grain />
        </TransitionProvider>
      </SmoothScroll>
    </MotionConfig>
  );
}
