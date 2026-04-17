import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Karalama — Türkçe multiplayer çizim oyunu';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px',
          background:
            'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.35), transparent 50%), radial-gradient(circle at 80% 30%, rgba(34,211,238,0.25), transparent 50%), radial-gradient(circle at 50% 90%, rgba(16,185,129,0.18), transparent 45%), #04070d',
          color: '#f0f2f5',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Grid pattern via lines */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Top badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1, #22d3ee, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px',
              fontWeight: 800,
              color: '#04070d',
            }}
          >
            K
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Karalama
          </div>
          <div
            style={{
              marginLeft: '12px',
              padding: '8px 16px',
              borderRadius: '999px',
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#34d399',
              fontSize: '18px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '999px', background: '#34d399' }} />
            Canlı
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '112px',
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
            marginBottom: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '18px',
          }}
        >
          <span>Çiz, Tahmin Et,</span>
          <span
            style={{
              background: 'linear-gradient(135deg, #6366f1, #22d3ee, #10b981)',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitBackgroundClip: 'text',
            }}
          >
            Eğlen.
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '32px',
            color: 'rgba(148,163,184,0.9)',
            maxWidth: '920px',
            marginBottom: '48px',
            lineHeight: 1.3,
          }}
        >
          Arkadaşlarınla saniyeler içinde oyna. Türkçe kelime hazinesi, gerçek zamanlı çizim — ücretsiz.
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '32px' }}>
          {[
            { v: '1.070+', l: 'Kelime' },
            { v: '18', l: 'Kategori' },
            { v: '12', l: 'Oyuncu/Oda' },
            { v: '%100', l: 'Ücretsiz' },
          ].map((s) => (
            <div
              key={s.l}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 24px',
                borderRadius: '16px',
                background: 'rgba(148,163,184,0.06)',
                border: '1px solid rgba(148,163,184,0.12)',
              }}
            >
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#f0f2f5' }}>{s.v}</div>
              <div style={{ fontSize: '16px', color: 'rgba(148,163,184,0.8)', marginTop: '4px' }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
