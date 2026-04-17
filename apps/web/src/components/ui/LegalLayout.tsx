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
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-8 transition-colors"
        >
          <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Ana sayfa
        </Link>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-50 mb-2">
          {title}
        </h1>
        <p className="text-sm text-slate-500 mb-12">
          Son güncelleme: {updated}
        </p>

        <article className="prose-custom text-slate-300 leading-relaxed space-y-6">
          {children}
        </article>
      </div>
    </main>
  );
}
