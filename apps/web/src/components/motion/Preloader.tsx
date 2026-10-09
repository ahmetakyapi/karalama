import { DOODLE_HEAD } from '@/components/ui/Doodle';

/**
 * Jagged tear line across the sheet, as [x%, y%] points left → right.
 * Hand-tuned (not random) so server and client render the same polygon.
 */
const TEAR: [number, number][] = [
  [0, 52.5], [4, 50.7], [8, 52.0], [12, 50.2], [16, 51.9], [20, 50.3], [24, 51.8], [28, 49.8],
  [32, 51.2], [36, 49.6], [40, 51.2], [44, 49.2], [48, 50.8], [52, 49.3], [56, 50.7], [60, 48.9],
  [64, 50.6], [68, 48.7], [72, 50.1], [76, 48.3], [80, 49.6], [84, 47.9], [88, 49.6], [92, 48.0],
  [96, 49.4], [100, 47.8],
];

const pt = ([x, y]: [number, number], dy = 0) =>
  dy ? `${x}% calc(${y}% + ${dy}px)` : `${x}% ${y}%`;

const TOP = `polygon(0% 0%, 100% 0%, ${[...TEAR].reverse().map((p) => pt(p)).join(', ')})`;
const BOTTOM = `polygon(${TEAR.map((p) => pt(p)).join(', ')}, 100% 100%, 0% 100%)`;
// Paper's white core peeking out along the rip — a slightly different jag than the ink side
const TOP_FIBER = `polygon(0% 0%, 100% 0%, ${[...TEAR].reverse().map((p, i) => pt(p, i % 2 ? 7 : 4)).join(', ')})`;
const BOTTOM_FIBER = `polygon(${TEAR.map((p, i) => pt(p, i % 2 ? -4 : -7)).join(', ')}, 100% 100%, 0% 100%)`;

function Pencil() {
  return (
    <svg viewBox="0 0 44 44" width="44" height="44">
      <g transform="rotate(-45 22 22)">
        <polygon points="-6,22 6,17 6,27" fill="#f5d0a9" />
        <polygon points="-6,22 -1,20 -1,24" fill="#1f2430" />
        <rect x="6" y="17" width="34" height="10" fill="#fbbf24" />
        <rect x="6" y="21" width="34" height="2" fill="#f59e0b" />
        <rect x="40" y="17" width="4" height="10" fill="#cbd5e1" />
        <rect x="44" y="17" width="6" height="10" rx="2" fill="#f472b6" />
      </g>
    </svg>
  );
}

/** One full sheet of notebook paper with the sketch on it. Rendered twice (the two torn halves). */
function Sheet() {
  return (
    <div className="ps-sheet">
      <div className="ps-stage">
        {/* The cat, scribbled line by line */}
        <div className="ps-cat-box">
          <div className="ps-cat">
            <svg viewBox="0 0 200 200" width="200" height="200" fill="none" overflow="visible">
              {/* doodle marks around the cat */}
              <path
                className="ps-draw ps-star"
                d="M170 26 L175 40 L190 41 L178 50 L182 64 L170 56 L158 64 L162 50 L150 41 L165 40 Z"
                pathLength={1}
                stroke="#4f46e5"
                strokeWidth="3.2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                className="ps-pop ps-star-fill"
                d="M170 31 L174 42 L185 43 L176 50 L179 60 L170 54 L161 60 L164 50 L155 43 L166 42 Z"
                fill="#c8f560"
              />
              <path
                className="ps-draw ps-squiggle"
                d="M2 160 q8 -14 16 0 t16 0 t16 0"
                pathLength={1}
                stroke="#db2777"
                strokeWidth="3.4"
                strokeLinecap="round"
              />
              <path
                className="ps-draw ps-ticks"
                d="M40 54 L28 44 M46 40 L42 26 M58 34 L60 20"
                pathLength={1}
                stroke="#1f2430"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* head: a first pass, then a lighter re-trace like a real sketch */}
              <path
                className="ps-draw ps-head"
                d={DOODLE_HEAD}
                pathLength={1}
                stroke="#1f2430"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                className="ps-draw ps-head2"
                d={DOODLE_HEAD}
                pathLength={1}
                transform="translate(2.5 -2) rotate(-1.2 100 100)"
                stroke="#1f2430"
                strokeOpacity="0.32"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <ellipse className="ps-pop ps-cheek" cx="72" cy="130" rx="9" ry="5" fill="#f472b6" fillOpacity="0.6" />
              <ellipse className="ps-pop ps-cheek ps-cheek-r" cx="128" cy="130" rx="9" ry="5" fill="#f472b6" fillOpacity="0.6" />
              <circle className="ps-eye" cx="84" cy="110" r="6.5" fill="#1f2430" />
              <circle className="ps-eye ps-eye-r" cx="116" cy="110" r="6.5" fill="#1f2430" />
              <path
                className="ps-draw ps-face"
                d="M94 126 L100 131 L106 126 M100 131 Q99 141 90 141 M100 131 Q101 141 110 141"
                pathLength={1}
                stroke="#1f2430"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                className="ps-draw ps-whiskers"
                d="M64 126 L34 120 M64 135 L36 141 M136 126 L166 120 M136 135 L164 141"
                pathLength={1}
                stroke="#4a5060"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            {/* pencil tip rides the head path */}
            <div className="ps-pencil" style={{ offsetPath: `path('${DOODLE_HEAD}')` }}>
              <Pencil />
            </div>
          </div>
        </div>

        {/* Wordmark, lettered left → right with a highlighter swipe */}
        <div className="ps-word-wrap">
          <span className="ps-swash" />
          <span className="ps-word font-display">
            Karalama<span className="text-[#e04a4a]">.</span>
          </span>
          <span className="ps-writer">
            <span className="ps-pencil2">
              <Pencil />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * First-visit intro: a pencil sketches the Karalama cat on a sheet of notebook
 * paper, letters the name, and the sheet is torn away to reveal the page.
 * Rendered on the server and animated purely with CSS, so it starts on the
 * very first paint. The <head> boot script adds `intro-seen` to skip it
 * (repeat visits, deep links, reduced motion); see `.preloader` in globals.css.
 */
export function Preloader() {
  return (
    <div className="preloader" role="status" aria-label="Karalama yükleniyor">
      <div className="ps-under" aria-hidden="true" />
      <div className="ps-piece ps-top" aria-hidden="true">
        <div className="ps-fiber" style={{ clipPath: TOP_FIBER }} />
        <div className="ps-clip" style={{ clipPath: TOP }}>
          <Sheet />
        </div>
      </div>
      <div className="ps-piece ps-bottom" aria-hidden="true">
        <div className="ps-fiber" style={{ clipPath: BOTTOM_FIBER }} />
        <div className="ps-clip" style={{ clipPath: BOTTOM }}>
          <Sheet />
        </div>
      </div>
    </div>
  );
}
