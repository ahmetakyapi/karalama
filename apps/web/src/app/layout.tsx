import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Çiz Tahmin Et - Multiplayer Çizim Oyunu',
  description:
    'Arkadaşlarınla çiz, tahmin et, eğlen! Gerçek zamanlı multiplayer çizim oyunu.',
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
      <body className="bg-bg-primary text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
