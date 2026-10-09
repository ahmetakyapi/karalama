'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SectionHeading } from '@/components/motion/primitives';
import { EXPO } from '@/components/motion/hooks';

const FAQS = [
  {
    q: 'Oyun Nasıl Oynanıyor?',
    a: 'Bir oda oluştur, altı haneli kodu ya da bağlantıyı arkadaşlarına gönder. Herkes gelince turu başlat. Sırası gelen oyuncu bir kelime seçip çizer, diğerleri sohbete tahmin yazar. Ne kadar hızlı bilirsen o kadar çok puan alırsın.',
  },
  {
    q: 'Üye Olmam Gerekiyor mu?',
    a: 'Hayır. Bir isim ve karakter seçmen yeterli. Bilgilerin tarayıcında saklanır, bir dahaki gelişinde hazır olur.',
  },
  {
    q: 'Kaç Kişi Oynayabilir?',
    a: 'Bir odada 2 ila 12 kişi oynayabilir. Az kişiyseniz bot ekleyerek oyunu hareketlendirebilirsin.',
  },
  {
    q: 'Kendi Kelimelerimi Ekleyebilir miyim?',
    a: 'Elbette. Oda kurarken kelimelerini virgülle ya da alt alta yazman yeterli. İstersen yalnızca kendi listenle de oynayabilirsin.',
  },
  {
    q: 'Telefonda Çalışıyor mu?',
    a: 'Evet. Telefonda ve tablette parmağınla çizebilir, sohbete yazıp tahmin edebilirsin. Tarayıcıdan açman yeterli, uygulama indirmen gerekmez.',
  },
  {
    q: 'Gerçekten Ücretsiz mi?',
    a: 'Evet. Reklam yok, uygulama içi satın alma yok, hesap açmak yok. Karalama, keyif için yapılmış bir proje.',
  },
];

type Msg = { id: number; from: 'me' | 'bot'; text: string };

function Typing() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-white/[0.06] px-4 py-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-slate-400"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </div>
  );
}

/**
 * FAQ as the game's own chat: tap a question, it is "sent" as your message
 * and Karalama types the answer back.
 */
export default function FAQSection() {
  const [asked, setAsked] = useState<number[]>([0]);
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 0, from: 'bot', text: 'Selam! Aklına takılan bir şey mi var? Bir soru seç, hemen anlatayım.' },
    { id: 1, from: 'me', text: FAQS[0].q },
    { id: 2, from: 'bot', text: FAQS[0].a },
  ]);
  const [typing, setTyping] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  const ask = (i: number) => {
    if (typing) return;
    setAsked((a) => (a.includes(i) ? a : [...a, i]));
    setMsgs((m) => [...m, { id: Date.now(), from: 'me', text: FAQS[i].q }]);
    setTyping(true);
    timer.current = setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { id: Date.now() + 1, from: 'bot', text: FAQS[i].a }]);
    }, 700);
  };

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
    <section id="topluluk" aria-labelledby="faq-title" className="cv-auto relative z-10 mx-auto max-w-6xl px-5 sm:px-6 py-16 sm:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Full Q&A for search engines and screen readers */}
      <dl className="sr-only">
        {FAQS.map((f) => (
          <div key={f.q}>
            <dt>{f.q}</dt>
            <dd>{f.a}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <SectionHeading
            id="faq-title"
            index="03"
            eyebrow="Sıkça Sorulanlar"
            title={['Merak', { text: 'Edilenler', className: 'text-gradient' }]}
          />
          <div className="-mt-6 flex flex-wrap gap-2" aria-label="Sorular">
            {FAQS.map((f, i) => {
              const done = asked.includes(i);
              return (
                <motion.button
                  key={f.q}
                  type="button"
                  onClick={() => ask(i)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'rounded-full border px-4 py-2 text-left text-sm font-semibold transition-colors duration-300',
                    done
                      ? 'border-transparent bg-white/[0.06] text-slate-400'
                      : 'border-white/10 text-slate-200 hover:border-[var(--marker)] hover:text-white'
                  )}
                >
                  {done && <span className="mr-1.5 text-[var(--marker)]">✓</span>}
                  {f.q}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Chat window, styled like the in-game chat */}
        <div role="log" aria-live="polite" aria-label="Sorular ve cevaplar" className="flex h-[440px] flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#070b14]">
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--marker)] font-hand text-xl font-bold text-[#04070d]">
              K
            </span>
            <div>
              <div className="text-sm font-bold text-slate-100">Karalama</div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Çevrimiçi
              </div>
            </div>
          </div>

          <div ref={scroller} data-lenis-prevent className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
            <AnimatePresence initial={false}>
              {msgs.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: EXPO }}
                  className={cn('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}
                >
                  <p
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                      m.from === 'me'
                        ? 'rounded-br-md bg-[var(--marker)] font-semibold text-[#04070d]'
                        : 'rounded-bl-md bg-white/[0.06] text-slate-200'
                    )}
                  >
                    {m.text}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
            {typing && <Typing />}
          </div>

          <div className="border-t border-white/[0.06] px-5 py-3 text-xs text-slate-500">
            Bir soru seç, cevabı hemen gelsin…
          </div>
        </div>
      </div>
    </section>
  );
}
