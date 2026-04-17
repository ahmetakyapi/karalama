import Link from 'next/link';

export const metadata = {
  title: 'Sayfa bulunamadı',
  description: 'Aradığın sayfa mevcut değil.',
};

export default function NotFound() {
  return (
    <main
      role="main"
      className="relative min-h-screen flex items-center justify-center px-6"
      style={{
        background:
          'radial-gradient(circle at 18% 12%, rgba(79,70,229,0.14), transparent 30%), radial-gradient(circle at 82% 10%, rgba(34,211,238,0.09), transparent 24%), #04070d',
      }}
    >
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />

      <div className="relative text-center max-w-md">
        <div
          aria-hidden="true"
          className="text-[120px] sm:text-[160px] font-extrabold leading-none tracking-tighter mb-2"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #22d3ee, #10b981)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 mb-3 tracking-tight">
          Sayfa bulunamadı
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed mb-8">
          Link kırılmış olabilir ya da oda süresi dolmuş olabilir. Ana sayfadan yeni bir oda oluşturabilirsin.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 h-12 text-sm font-bold text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)] hover:shadow-[0_12px_32px_rgba(99,102,241,0.5)] transition-all"
        >
          Ana Sayfaya Dön
          <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
