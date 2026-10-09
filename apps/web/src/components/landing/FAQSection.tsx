'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SectionHeading } from '@/components/motion/primitives';
import { EXPO } from '@/components/motion/hooks';

const FAQS = [
  {
    q: 'Oyun nasıl çalışıyor?',
    a: 'Bir oda oluştur, 6 karakterlik kodu veya linki arkadaşlarına gönder. Herkes katıldığında tura başlarsın. Sırası gelen oyuncu bir kelime seçer ve çizer, diğerleri sohbet üzerinden tahmin eder. Hızlı bilen daha çok puan kazanır.',
  },
  {
    q: 'Kayıt olmam gerekir mi?',
    a: 'Hayır. İsmini ve avatarını seçmen yeterli. İstersen tarayıcıda saklı kalır, bir sonraki gelişinde hazır olur.',
  },
  {
    q: 'Kaç kişi oynayabilir?',
    a: 'Bir odada 2 ile 12 oyuncu arasında oynayabilirsin. Az kişiyseniz bot ekleyerek maçı renklendirebilirsiniz.',
  },
  {
    q: 'Özel kelime listesi ekleyebilir miyim?',
    a: 'Evet. Oda oluşturma ekranında kendi kelimelerini virgül ya da satır ile ayırarak yapıştırabilirsin. İsterseniz tamamen kendi listenizle de oynayabilirsiniz.',
  },
  {
    q: 'Mobilde çalışıyor mu?',
    a: 'Evet. Telefon ve tablette parmakla çizim, sohbet ve tahmin tam olarak çalışır. Tarayıcıdan açman yeterli, indirme gerekmez.',
  },
  {
    q: 'Reklamsız ve ücretsiz mi?',
    a: 'Evet — reklam yok, mikro-ödeme yok, hesap yok. Açık kaynak ruhlu, keyif odaklı bir proje.',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <section id="topluluk" aria-labelledby="faq-title" className="relative z-10 mx-auto max-w-6xl px-5 sm:px-6 py-24 sm:py-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="faq-title"
            index="03"
            eyebrow="Sıkça Sorulanlar"
            title={['Merak', '\n', { text: 'edilenler.', className: 'text-gradient' }]}
          />
          <p className="-mt-8 hidden max-w-xs font-hand text-2xl leading-snug text-slate-400 lg:block">
            Cevabını bulamadın mı? Bir oda aç, oynarken öğrenirsin. ✎
          </p>
        </div>

        <ul className="border-b border-white/10">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.li
                key={f.q}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-8% 0px' }}
                transition={{ duration: 0.9, ease: EXPO, delay: i * 0.05 }}
                className="relative"
              >
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px origin-left bg-white/10"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: EXPO, delay: 0.1 + i * 0.05 }}
                />
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="group flex w-full items-center gap-5 py-6 text-left sm:py-7"
                >
                  <span className={cn('font-mono text-xs transition-colors duration-300', isOpen ? 'text-[var(--marker)]' : 'text-slate-600')}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={cn(
                      'flex-1 font-display text-xl sm:text-2xl font-semibold tracking-[-0.025em] transition-all duration-500 ease-expo',
                      isOpen ? 'translate-x-1 text-slate-50' : 'text-slate-300 group-hover:translate-x-2 group-hover:text-slate-50'
                    )}
                  >
                    {f.q}
                  </span>
                  <motion.span
                    aria-hidden="true"
                    animate={{ rotate: isOpen ? 135 : 0, backgroundColor: isOpen ? 'rgba(200,245,96,1)' : 'rgba(255,255,255,0.04)' }}
                    transition={{ duration: 0.5, ease: EXPO }}
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xl leading-none',
                      isOpen ? 'border-transparent text-[#04070d]' : 'border-white/10 text-slate-300'
                    )}
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.55, ease: EXPO }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-xl pb-7 pl-10 text-base leading-relaxed text-slate-400">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
