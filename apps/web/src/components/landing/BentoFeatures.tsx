'use client';

import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/motion/primitives';

type Note = {
  title: string;
  text: string;
  paper: string;
  tilt: number;
  /** Hand-drawn icon strokes (viewBox 0 0 48 48) */
  icon: string[];
};

const NOTES: Note[] = [
  {
    title: 'Gerçek Zamanlı Çizim',
    text: 'Çizdiğin her çizgi, milisaniyeler içinde herkesin ekranında belirir.',
    paper: '#fde68a',
    tilt: -3,
    icon: ['M8 38 L30 16 L36 22 L14 44 L6 46 Z', 'M28 18 L34 24', 'M30 8 C 36 4, 44 10, 40 16'],
  },
  {
    title: '1.070+ Türkçe Kelime',
    text: '18 kategori, üç zorluk seviyesi. İstersen kendi kelimelerini de ekleyebilirsin.',
    paper: '#bae6fd',
    tilt: 2,
    icon: ['M6 40 L16 10 L26 40', 'M10 30 L22 30', 'M32 24 C 44 20, 44 40, 32 38 C 26 37, 28 28, 40 30 L40 40'],
  },
  {
    title: 'Her Cihazda Çalışır',
    text: 'Telefonda parmağınla, bilgisayarda fareyle çiz. Uygulama indirmen gerekmez.',
    paper: '#d9f99d',
    tilt: -1.5,
    icon: ['M14 6 L34 6 C 37 6, 38 8, 38 10 L38 40 C 38 43, 36 44, 34 44 L14 44 C 11 44, 10 42, 10 40 L10 10 C 10 7, 12 6, 14 6 Z', 'M20 38 L28 38'],
  },
  {
    title: 'Kayıt Gerekmez',
    text: 'Adını yaz, bağlantıyı paylaş, oyna. Hepsi bu kadar.',
    paper: '#fbcfe8',
    tilt: 3,
    icon: ['M10 24 L20 34 L40 12'],
  },
  {
    title: 'Akıllı İpuçları',
    text: 'Süre ilerledikçe harfler açılır; yaklaştığında sana haber veririz.',
    paper: '#ddd6fe',
    tilt: -2.5,
    icon: ['M24 6 C 14 6, 10 14, 12 22 C 13 27, 18 29, 18 34 L30 34 C 30 29, 35 27, 36 22 C 38 14, 34 6, 24 6 Z', 'M19 40 L29 40', 'M21 45 L27 45'],
  },
  {
    title: 'Bot Desteği',
    text: 'Az kişiyseniz bot ekleyin; oyun hiç durmasın.',
    paper: '#fed7aa',
    tilt: 1.5,
    icon: ['M10 16 L38 16 L38 40 L10 40 Z', 'M24 16 L24 8', 'M18 26 L18 28', 'M30 26 L30 28', 'M18 34 L30 34'],
  },
];

function StickyNote({ note, i }: { note: Note; i: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: -80, rotate: note.tilt * 4 }}
      whileInView={{ opacity: 1, y: 0, rotate: note.tilt }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ type: 'spring', stiffness: 140, damping: 16, delay: (i % 3) * 0.08 }}
      whileHover={{ rotate: 0, y: -8, scale: 1.03 }}
      className="group relative list-none"
    >
      {/* tape */}
      <span
        aria-hidden="true"
        className="absolute -top-3 left-1/2 z-10 h-6 w-24 -translate-x-1/2 bg-white/50 shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
        style={{ clipPath: 'polygon(4% 0, 96% 8%, 100% 90%, 0 100%)', rotate: `${-note.tilt * 2}deg` }}
      />
      <article
        className="relative h-full min-h-[230px] rounded-[3px] p-6 text-[#1f2430] shadow-[0_18px_30px_-12px_rgba(0,0,0,0.7)] transition-shadow duration-500 group-hover:shadow-[0_30px_50px_-16px_rgba(0,0,0,0.75)]"
        style={{
          background: `linear-gradient(180deg, ${note.paper}, color-mix(in srgb, ${note.paper} 88%, #000))`,
        }}
      >
        <svg viewBox="0 0 48 48" className="mb-5 h-11 w-11" fill="none" aria-hidden="true">
          {note.icon.map((d, k) => (
            <motion.path
              key={k}
              d={d}
              stroke="#1f2430"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: 'easeInOut', delay: 0.35 + k * 0.2 }}
            />
          ))}
        </svg>
        <h3 className="mb-2 font-display text-2xl font-bold leading-tight tracking-[-0.03em]">{note.title}</h3>
        <p className="font-hand text-xl leading-snug text-[#3b4050]">{note.text}</p>
        {/* curled corner */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 right-0 h-8 w-8"
          style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.12) 50%, rgba(255,255,255,0.35) 100%)' }}
        />
      </article>
    </motion.li>
  );
}

export default function BentoFeatures() {
  return (
    <section id="ozellikler" className="cv-auto relative z-10 mx-auto max-w-6xl px-5 sm:px-6 pb-12 pt-4 sm:pb-16 sm:pt-6">
      <SectionHeading
        title={['Neden', { text: 'Karalama?', className: 'text-gradient' }]}
        desc="Güzel bir oyun gecesi için ihtiyacın olan her şey burada: hızlı, Türkçe ve ücretsiz."
      />
      <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {NOTES.map((n, i) => (
          <StickyNote key={n.title} note={n} i={i} />
        ))}
      </ul>
    </section>
  );
}
