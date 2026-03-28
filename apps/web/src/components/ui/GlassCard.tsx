'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  glowColor?: string;
}

export function GlassCard({
  children,
  hoverable,
  glowColor,
  className,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'glass',
        hoverable && 'hover:border-white/[0.15] transition-all duration-500 ease-custom cursor-pointer',
        className
      )}
      style={
        glowColor
          ? { boxShadow: `0 0 40px -10px ${glowColor}` }
          : undefined
      }
      {...(props as Record<string, unknown>)}
    >
      {children}
    </motion.div>
  );
}
