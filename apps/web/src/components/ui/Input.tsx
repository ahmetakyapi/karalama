'use client';

import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      <input
        className={cn(
          'w-full px-4 py-3 rounded-xl',
          'bg-white/[0.05] border border-white/[0.08]',
          'text-white placeholder:text-white/30',
          'focus:outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/30',
          'transition-all duration-300 ease-custom',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
