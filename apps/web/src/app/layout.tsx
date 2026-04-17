import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeApplier } from '@/components/ui/ThemeApplier';
import { ToastStack } from '@/components/ui/ToastStack';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
  adjustFontFallback: true,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://karalama.vercel.app';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://karalama-server.up.railway.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Karalama — Çiz, Tahmin Et, Eğlen',
    template: '%s · Karalama',
  },
  description:
    'Arkadaşlarınla saniyeler içinde oyna. 1070+ Türkçe kelime, gerçek zamanlı çizim, bot desteği. Kayıt yok, indirme yok, ücretsiz.',
  applicationName: 'Karalama',
  keywords: [
    'karalama',
    'çizim oyunu',
    'çiz tahmin et',
    'skribbl türkçe',
    'multiplayer çizim',
    'türkçe kelime oyunu',
    'arkadaşlarla oyun',
  ],
  authors: [{ name: 'Karalama' }],
  creator: 'Karalama',
  publisher: 'Karalama',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: SITE_URL,
    siteName: 'Karalama',
    title: 'Karalama — Çiz, Tahmin Et, Eğlen',
    description:
      'Arkadaşlarınla saniyeler içinde oyna. 1070+ Türkçe kelime, gerçek zamanlı çizim. Kayıt yok, ücretsiz.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Karalama — Türkçe multiplayer çizim oyunu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Karalama — Çiz, Tahmin Et, Eğlen',
    description:
      'Arkadaşlarınla saniyeler içinde oyna. 1070+ Türkçe kelime, gerçek zamanlı çizim. Ücretsiz.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: '/icons/icon.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Karalama',
  },
  category: 'games',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#04070d',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Karalama',
  url: SITE_URL,
  description:
    'Gerçek zamanlı Türkçe multiplayer çizim ve tahmin oyunu. 1070+ kelime, 18 kategori.',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Any (Web)',
  inLanguage: 'tr-TR',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href={SOCKET_URL} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={SOCKET_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-bg-primary text-white antialiased min-h-screen">
        <a
          href="#oyna"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-indigo-500 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
        >
          Ana içeriğe atla
        </a>
        <ThemeApplier />
        {children}
        <ToastStack />
      </body>
    </html>
  );
}
