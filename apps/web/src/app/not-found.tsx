import Link from 'next/link';

export const metadata = {
  title: 'Sayfa Bulunamadı',
  description: 'Aradığın sayfa mevcut değil.',
};

export default function NotFound() {
  return (
    <main
      role="main"
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-6"
      style={{
        background:
          'radial-gradient(circle at 18% 12%, rgba(79,70,229,0.14), transparent 30%), radial-gradient(circle at 82% 10%, rgba(34,211,238,0.09), transparent 24%), #04070d',
      }}
    >
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />

      <div className="relative text-center max-w-xl">
        <div aria-hidden="true" className="relative mx-auto mb-6 w-fit">
          <div className="animate-rise font-display text-[150px] sm:text-[220px] font-extrabold leading-none tracking-[-0.07em] text-outline">
            404
          </div>
          {/* A scribble crossing out the number — "karalanmış" */}
          <svg viewBox="0 0 400 200" className="absolute inset-0 h-full w-full" fill="none">
            <path
              d="M20 120 C 80 40, 120 170, 180 90 S 260 30, 300 120 S 370 150, 390 70"
              stroke="url(#nf-grad)"
              strokeWidth="9"
              strokeLinecap="round"
              className="scribble-in"
              style={{ ['--len' as string]: 620, animationDelay: '0.4s' }}
            />
            <defs>
              <linearGradient id="nf-grad" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#6366f1" />
                <stop offset="0.5" stopColor="#22d3ee" />
                <stop offset="1" stopColor="#c8f560" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className="animate-rise font-display text-3xl sm:text-4xl font-bold text-slate-50 mb-3 tracking-[-0.03em]" style={{ animationDelay: '1s' }}>
          Sayfa Bulunamadı
        </h1>
        <p className="animate-rise text-sm text-slate-400 leading-relaxed mb-10" style={{ animationDelay: '1.1s' }}>
          Bağlantı bozuk olabilir ya da odanın süresi dolmuş olabilir. Ana sayfadan yeni bir oda kurabilirsin.
        </p>
        <Link
          href="/"
          style={{ animationDelay: '1.2s' }}
          className="animate-rise group inline-flex items-center gap-2 rounded-2xl bg-[var(--marker)] px-7 h-14 text-sm font-bold text-[#04070d] shadow-[0_8px_32px_rgba(200,245,96,0.25)] transition-shadow hover:shadow-[0_12px_40px_rgba(200,245,96,0.45)]"
        >
          Ana Sayfaya Dön
          <svg aria-hidden="true" className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
