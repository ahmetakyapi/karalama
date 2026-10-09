import { cn } from '@/lib/utils';
import { Doodle } from './Doodle';

/**
 * Looping "pencil draws a cat" loader. CSS-only — safe in server components,
 * Suspense fallbacks and before hydration.
 */
export function InkLoader({
  label = 'Yükleniyor',
  className,
  gradientId = 'dd-grad-loader',
}: {
  label?: string;
  className?: string;
  gradientId?: string;
}) {
  return (
    <div role="status" aria-label={label} className={cn('flex flex-col items-center gap-3', className)}>
      <div className="flex h-[120px] w-[120px] items-center justify-center">
        <Doodle loop gradientId={gradientId} style={{ transform: 'scale(0.6)' }} />
      </div>
      <span className="ink-dots font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500">
        {label}
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </div>
  );
}
