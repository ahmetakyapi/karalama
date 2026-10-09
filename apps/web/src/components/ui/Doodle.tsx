import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/** One continuous stroke: ears + cat head. The pencil rides this exact path. */
export const DOODLE_HEAD =
  'M62 80 L56 42 L88 64 Q100 60 112 64 L144 42 L138 80 Q156 102 148 132 Q138 162 100 164 Q62 162 52 132 Q44 102 62 80 Z';

function Sparkle({ x, y, d }: { x: number; y: number; d: string }) {
  return (
    <path
      className="dd-pop"
      style={{ animationDelay: `calc(var(--t0) + ${d})` }}
      d={`M${x} ${y - 7} Q${x} ${y} ${x + 7} ${y} Q${x} ${y} ${x} ${y + 7} Q${x} ${y} ${x - 7} ${y} Q${x} ${y} ${x} ${y - 7} Z`}
      fill="#c8f560"
    />
  );
}

/**
 * A pencil sketches a little cat, which then blinks at you.
 * Pure SVG + CSS (see `.doodle` in globals.css) so it animates from the very
 * first paint — even before React hydrates.
 *
 * `loop` repeats forever (loaders); otherwise it plays once (intro).
 */
export function Doodle({
  loop = false,
  gradientId = 'dd-grad',
  className,
  style,
}: {
  loop?: boolean;
  /** Must be unique per page: a hidden instance's gradient can't be referenced. */
  gradientId?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={cn('doodle', loop && 'doodle-loop', className)} style={style} aria-hidden="true">
      <svg viewBox="0 0 200 200" width="200" height="200" fill="none">
        <defs>
          <linearGradient id={gradientId} x1="40" y1="40" x2="160" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#6366f1" />
            <stop offset="0.5" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#c8f560" />
          </linearGradient>
        </defs>

        <path
          className="dd-head"
          d={DOODLE_HEAD}
          pathLength={1}
          stroke={`url(#${gradientId})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <ellipse className="dd-pop" style={{ animationDelay: 'calc(var(--t0) + 0.1s)' }} cx="72" cy="130" rx="8" ry="4.5" fill="#f472b6" fillOpacity="0.55" />
        <ellipse className="dd-pop" style={{ animationDelay: 'calc(var(--t0) + 0.14s)' }} cx="128" cy="130" rx="8" ry="4.5" fill="#f472b6" fillOpacity="0.55" />

        <circle className="dd-eye" cx="84" cy="110" r="6.5" fill="#f8fafc" />
        <circle className="dd-eye" style={{ animationDelay: 'calc(var(--t0) + 0.05s)' }} cx="116" cy="110" r="6.5" fill="#f8fafc" />

        <path
          className="dd-stroke"
          d="M94 126 L100 131 L106 126 M100 131 Q99 141 90 141 M100 131 Q101 141 110 141"
          pathLength={1}
          stroke="#e2e8f0"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="dd-stroke"
          style={{ animationDelay: 'calc(var(--t0) + 0.08s)' }}
          d="M64 126 L34 120 M64 135 L36 141 M136 126 L166 120 M136 135 L164 141"
          pathLength={1}
          stroke="#94a3b8"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <Sparkle x={36} y={62} d="0.16s" />
        <Sparkle x={168} y={78} d="0.22s" />
        <Sparkle x={160} y={172} d="0.28s" />
      </svg>

      {/* Pencil: tip anchored on the head path via CSS offset-path */}
      <div className="dd-pencil" style={{ offsetPath: `path('${DOODLE_HEAD}')` }}>
        <svg viewBox="0 0 44 44" width="44" height="44">
          <g transform="rotate(-45 22 22)">
            <polygon points="-6,22 6,17 6,27" fill="#f5d0a9" />
            <polygon points="-6,22 -1,20 -1,24" fill="#1f2937" />
            <rect x="6" y="17" width="34" height="10" fill="#fbbf24" />
            <rect x="6" y="21" width="34" height="2" fill="#f59e0b" />
            <rect x="40" y="17" width="4" height="10" fill="#cbd5e1" />
            <rect x="44" y="17" width="6" height="10" rx="2" fill="#f472b6" />
          </g>
        </svg>
      </div>
    </div>
  );
}
