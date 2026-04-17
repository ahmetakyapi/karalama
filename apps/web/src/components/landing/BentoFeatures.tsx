'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeUp, TiltCard, Counter } from './common';

export default function BentoFeatures() {
  return (
    <section id="ozellikler" className="relative z-10 mx-auto max-w-6xl px-6 py-28">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="mb-14 text-center"
      >
        <motion.div variants={fadeUp} custom={0} className="mb-4 flex justify-center">
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
            Özellikler
          </span>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          custom={0.06}
          className="mb-3 text-4xl font-extrabold tracking-tight text-slate-50 sm:text-5xl"
        >
          Neden <span className="text-gradient">Karalama?</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          custom={0.12}
          className="mx-auto max-w-lg text-base text-slate-400"
        >
          Her detay, mükemmel bir oyun gecesi için düşünüldü.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[minmax(200px,auto)]"
      >
        {/* 1. Real-time drawing - big */}
        <motion.div variants={fadeUp} custom={0} className="md:col-span-4 md:row-span-2 min-h-[320px]">
          <TiltCard className="rounded-3xl p-8 h-full relative" glowColor="rgba(99,102,241,0.15)">
            <div className="flex flex-col h-full">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                <svg aria-hidden="true" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2 tracking-tight">
                Gerçek Zamanlı Çizim
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-md">
                Fırça her hareketi milisaniyeler içinde tüm oyunculara iletilir. Basınç hassas, pürüzsüz ve akıcı.
              </p>
              <div className="mt-auto rounded-2xl bg-[#060a14] border border-white/[0.05] p-4 relative overflow-hidden flex-1 min-h-[140px]">
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {['#6366f1', '#ef4444', '#22d3ee', '#f59e0b'].map((c) => (
                    <motion.div
                      key={c}
                      whileHover={{ scale: 1.2 }}
                      className="w-5 h-5 rounded-full border border-white/15"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <svg aria-hidden="true" viewBox="0 0 300 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  <motion.path
                    d="M 30 80 Q 60 20 100 60 T 170 55 T 260 70"
                    fill="none"
                    stroke="rgba(99,102,241,0.85)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="1000"
                    initial={{ strokeDashoffset: 1000 }}
                    whileInView={{ strokeDashoffset: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2.2, ease: 'easeOut', delay: 0.3 }}
                  />
                  <motion.circle
                    cx="260" cy="70" r="5"
                    fill="#22d3ee"
                    animate={{ cx: [30, 260, 30], cy: [80, 70, 80] }}
                    transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </svg>
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* 2. 1070+ words */}
        <motion.div variants={fadeUp} custom={0.08} className="md:col-span-2">
          <TiltCard className="rounded-3xl p-6 h-full" glowColor="rgba(34,211,238,0.15)">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
              <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502" />
              </svg>
            </div>
            <div className="text-3xl font-extrabold text-slate-100 mb-1 tracking-tight">
              <Counter to={1070} suffix="+" />
            </div>
            <div className="text-sm font-semibold text-slate-300 mb-1">Türkçe Kelime</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              18 kategori · 3 zorluk seviyesi
            </p>
          </TiltCard>
        </motion.div>

        {/* 3. Mobile friendly */}
        <motion.div variants={fadeUp} custom={0.12} className="md:col-span-2">
          <TiltCard className="rounded-3xl p-6 h-full" glowColor="rgba(16,185,129,0.15)">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-1.5">Mobil Uyumlu</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Telefondan parmağınla çiz, tabletten oyna. Her cihazda aynı deneyim.
            </p>
          </TiltCard>
        </motion.div>

        {/* 4. Instant start */}
        <motion.div variants={fadeUp} custom={0.16} className="md:col-span-3">
          <TiltCard className="rounded-3xl p-6 h-full relative overflow-hidden" glowColor="rgba(245,158,11,0.15)">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                  <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-1.5">Anında Başla</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-[240px]">
                  Kayıt yok, indirme yok. İsmini yaz, linki paylaş, oyna.
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 mt-1">
                {['✓ Kayıt Yok', '✓ İndirme Yok', '✓ Ücretsiz'].map((t, i) => (
                  <motion.span
                    key={t}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* 5. Hint system */}
        <motion.div variants={fadeUp} custom={0.2} className="md:col-span-3">
          <TiltCard className="rounded-3xl p-6 h-full" glowColor="rgba(168,85,247,0.15)">
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
                <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-100 mb-1.5">Akıllı İpuçları</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Harfler zamanla açılır. &quot;Yaklaştın&quot; uyarıları seni yönlendirir.
                </p>
                <div className="flex gap-1">
                  {['K', 'A', 'L', '_', 'M'].map((ch, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.6, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 300 }}
                      className={cn(
                        'w-7 h-8 rounded-md flex items-center justify-center text-xs font-bold',
                        ch !== '_'
                          ? 'bg-violet-500/15 border border-violet-500/30 text-violet-300'
                          : 'bg-white/[0.03] border border-white/[0.06] text-slate-500'
                      )}
                    >
                      {ch}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </motion.div>
    </section>
  );
}
