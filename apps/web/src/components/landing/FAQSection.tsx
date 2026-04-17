'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE, fadeUp } from './common';

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
    <section id="topluluk" aria-labelledby="faq-title" className="relative z-10 mx-auto max-w-3xl px-6 py-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="mb-12 text-center"
      >
        <motion.div variants={fadeUp} custom={0} className="mb-4 flex justify-center">
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Sıkça Sorulanlar
          </span>
        </motion.div>
        <motion.h2
          id="faq-title"
          variants={fadeUp}
          custom={0.06}
          className="text-4xl font-extrabold tracking-tight text-slate-50 sm:text-5xl"
        >
          Merak <span className="text-gradient">Edilenler</span>
        </motion.h2>
      </motion.div>

      <motion.ul
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="space-y-2"
      >
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <motion.li key={f.q} variants={fadeUp} custom={i * 0.05}>
              <div className="glass rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-base font-semibold text-slate-100">{f.q}</span>
                  <motion.span
                    aria-hidden="true"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 text-lg leading-none"
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
                      transition={{ duration: 0.25, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}
