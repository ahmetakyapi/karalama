'use client';

import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/utils';

export function Timer() {
  const { timeLeft, settings } = useGameStore();
  const total = settings.drawTime;
  const ratio = total > 0 ? timeLeft / total : 0;

  const circumference = 2 * Math.PI * 22;
  const offset = circumference * (1 - ratio);

  const colorClass =
    ratio > 0.5
      ? 'text-accent-emerald'
      : ratio > 0.2
        ? 'text-amber-400'
        : 'text-red-400';

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg
        className="absolute inset-0 -rotate-90"
        width="56"
        height="56"
        viewBox="0 0 56 56"
      >
        <circle
          cx="28"
          cy="28"
          r="22"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="3"
        />
        <circle
          cx="28"
          cy="28"
          r="22"
          fill="none"
          className={colorClass}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <span className={cn('text-sm font-bold font-mono', colorClass)}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}
