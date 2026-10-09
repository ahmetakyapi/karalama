import Link from 'next/link';

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main
      role="main"
      className="relative min-h-screen px-6 py-24"
      style={{
        background:
          'radial-gradient(circle at 20% 10%, rgba(99,102,241,0.08), transparent 35%), #04070d',
      }}
    >
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-30" />

      <div className="relative mx-auto max-w-3xl">
        <Link
          href="/"
          className="animate-rise group inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-10 transition-colors"
        >
          <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Ana Sayfa
        </Link>

        <h1
          className="animate-rise font-display text-5xl sm:text-7xl font-extrabold tracking-[-0.05em] text-slate-50 mb-3"
          style={{ animationDelay: '0.08s' }}
        >
          {title}
        </h1>
        <p className="animate-rise font-mono text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-14" style={{ animationDelay: '0.16s' }}>
          Son güncelleme: {updated}
        </p>

        <article
          className="animate-rise prose-custom text-slate-300 leading-relaxed space-y-6"
          style={{ animationDelay: '0.24s' }}
        >
          {children}
        </article>
      </div>
    </main>
  );
}
