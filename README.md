# Karalama - Çiz, Tahmin Et ve Eğlen!

Türkçe multiplayer çizim oyunu. Oda oluştur, linki paylaş, saniyeler içinde oynamaya başla.

## Özellikler

- 18 kategori, 1070+ Türkçe kelime
- Gerçek zamanlı çizim (Socket.io)
- Mobil uyumlu
- İpucu sistemi
- Skor & podium animasyonları
- Kayıt gerektirmez

## Teknik Stack

- **Web**: Next.js 14, Tailwind CSS, Framer Motion, Zustand
- **Server**: Node.js, Socket.io
- **Shared**: TypeScript monorepo (npm workspaces)

## Yerel Geliştirme

```bash
npm install
npm run dev
```

Web: http://localhost:3000
Server: http://localhost:3001

## Deploy

- **Web (Vercel)**: `NEXT_PUBLIC_SOCKET_URL` env var gerekli
- **Server (Railway)**: `CORS_ORIGIN` ve `PORT` env var gerekli

Detaylar için `.env.example` dosyasına bak.
