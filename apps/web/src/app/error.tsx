'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[app-error]', error);
  }, [error]);

  return (
    <main
      role="main"
      className="relative min-h-screen flex items-center justify-center px-6"
      style={{
        background:
          'radial-gradient(circle at 20% 15%, rgba(244,63,94,0.10), transparent 30%), #04070d',
      }}
    >
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />

      <div className="relative text-center max-w-md">
        <div
          aria-hidden="true"
          className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center"
        >
          <svg className="w-10 h-10 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.310-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.25-8.25-3.285zm0 13.036h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 mb-3 tracking-tight">
          Beklenmedik bir hata oluştu
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed mb-8">
          Sorunu kaydettik. Sayfayı tekrar deneyebilir ya da ana sayfaya dönebilirsin.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 h-12 text-sm font-bold text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)] hover:shadow-[0_12px_32px_rgba(99,102,241,0.5)] transition-all"
          >
            Tekrar dene
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.08] px-6 h-12 text-sm font-semibold text-slate-200 hover:bg-white/[0.06] hover:border-white/[0.15] transition-all"
          >
            Ana sayfa
          </a>
        </div>
        {error.digest && (
          <p className="mt-6 text-[10px] font-mono text-slate-600">
            ref: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
