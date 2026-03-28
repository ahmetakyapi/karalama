'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'gradient-bg text-white shadow-lg shadow-accent-indigo/20 hover:shadow-accent-indigo/40',
  secondary:
    'glass border border-white/[0.08] text-white hover:border-white/[0.15]',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
  ghost: 'text-white/60 hover:text-white hover:bg-white/[0.05]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={cn(
        'font-medium transition-all duration-300 ease-custom',
        'focus:outline-none focus:ring-2 focus:ring-accent-indigo/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </motion.button>
  );
}
