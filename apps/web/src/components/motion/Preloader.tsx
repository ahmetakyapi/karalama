import { Doodle } from '@/components/ui/Doodle';

const COLUMNS = 5;
const WORD = 'Karalama';
const STATUS = ['Kalem açıldı', 'Kedi çiziliyor', 'Bıyıklar ekleniyor', 'Hazır, miyav'];

/**
 * First-visit intro, rendered on the server and animated purely with CSS so it
 * starts on the very first paint — no waiting for the JS bundle to hydrate.
 * The <head> boot script adds `intro-seen` to skip it (repeat visits, deep
 * links, reduced motion); see `.preloader` rules in globals.css.
 */
export function Preloader() {
  return (
    <div className="preloader" role="status" aria-label="Karalama yükleniyor">
      {Array.from({ length: COLUMNS }).map((_, i) => (
        <div key={i} className="pre-col" style={{ ['--i' as string]: i }} />
      ))}

      <div className="pre-content" aria-hidden="true">
        <div className="flex items-start justify-between font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-slate-500">
          <span>Karalama ®</span>
          <span className="hidden sm:block">Çiz — Tahmin Et — Eğlen</span>
          <span>{new Date().getFullYear()}</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex h-[210px] w-[210px] items-center justify-center sm:h-[270px] sm:w-[270px]">
            <Doodle className="pre-doodle" />
          </div>
          <div className="mt-2 flex overflow-hidden pb-[0.1em] font-display text-[15vw] sm:text-[7.5vw] font-extrabold leading-[0.95] tracking-[-0.05em] text-slate-50">
            {WORD.split('').map((ch, i) => (
              <span key={i} className="pre-letter" style={{ ['--i' as string]: i }}>
                {ch}
              </span>
            ))}
            <span className="pre-letter text-[var(--marker)]" style={{ ['--i' as string]: WORD.length }}>
              .
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-6">
          <div className="pre-count font-display text-[22vw] sm:text-[11vw] font-extrabold leading-[0.78] tracking-[-0.06em] text-slate-50 tabular-nums">
            <span className="text-[var(--marker)]">%</span>
          </div>
          <div className="mb-2 max-w-[40vw] text-right">
            <div className="relative h-9 sm:h-10 font-hand text-2xl sm:text-3xl text-slate-300">
              {STATUS.map((s, i) => (
                <span
                  key={s}
                  className={i === STATUS.length - 1 ? 'pre-status pre-status-last' : 'pre-status'}
                  style={{ ['--i' as string]: i }}
                >
                  {s}…
                </span>
              ))}
            </div>
            <div className="mt-3 ml-auto h-px w-32 sm:w-48 overflow-hidden bg-white/10">
              <div className="pre-bar h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-[#c8f560]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
