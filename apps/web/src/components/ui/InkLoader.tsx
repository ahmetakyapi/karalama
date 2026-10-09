import { cn } from '@/lib/utils';

/** CSS-only scribble loader — safe in server components and Suspense fallbacks. */
export function InkLoader({ label = 'Yükleniyor', className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-label={label} className={cn('flex flex-col items-center gap-4', className)}>
      <svg viewBox="0 0 120 40" className="ink-loader w-28" fill="none" aria-hidden="true">
        <path
          d="M6 26 C 18 6, 30 34, 44 18 S 66 4, 78 22 S 100 36, 114 12"
          stroke="url(#ink-loader-grad)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="ink-loader-grad" x1="0" y1="0" x2="120" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#6366f1" />
            <stop offset="0.55" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#c8f560" />
          </linearGradient>
        </defs>
      </svg>
      <span className="ink-dots font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500">
        {label}
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </div>
  );
}
