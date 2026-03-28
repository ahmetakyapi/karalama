'use client';

import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  isHost?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

export function Avatar({
  name,
  color,
  size = 'md',
  isHost,
  className,
}: AvatarProps) {
  const letter = name.charAt(0).toUpperCase();

  return (
    <div className={cn('relative inline-flex', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-bold text-white',
          sizeMap[size]
        )}
        style={{ backgroundColor: color }}
      >
        {letter}
      </div>
      {isHost && (
        <span className="absolute -top-1 -right-1 text-xs">
          {'\u{1F451}'}
        </span>
      )}
    </div>
  );
}
