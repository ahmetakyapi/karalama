'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'info' | 'danger';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-white/70',
  success: 'bg-emerald-500/20 text-emerald-400',
  warning: 'bg-amber-500/20 text-amber-400',
  info: 'bg-cyan-500/20 text-cyan-400',
  danger: 'bg-red-500/20 text-red-400',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
