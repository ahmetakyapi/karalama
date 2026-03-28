import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Karalama - Çiz, Tahmin Et ve Eğlen!',
  description:
    'Arkadaşlarınla çiz, tahmin et, eğlen! Gerçek zamanlı multiplayer Türkçe çizim oyunu.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Karalama',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#04070d" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className="bg-bg-primary text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
