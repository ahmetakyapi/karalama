'use client';

import { useEffect, useRef } from 'react';
import { useLowMotion, useMediaQuery } from '@/components/motion/hooks';

type Pt = { x: number; y: number; t: number };

const LIFE = 900;
const COLORS = ['#6366f1', '#22d3ee', '#10b981', '#c8f560'];

/**
 * Cursor leaves a fading marker stroke across the hero — the brand, literally:
 * you "karala" (scribble) the page just by moving.
 */
export function InkTrail({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lowMotion = useLowMotion();
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || lowMotion || !fine) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pts: Pt[] = [];
    let raf = 0;
    let running = false;
    let visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    const draw = () => {
      const now = performance.now();
      while (pts.length && now - pts[0].t > LIFE) pts.shift();
      const r = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const life = 1 - (now - b.t) / LIFE;
        if (life <= 0) continue;
        ctx.strokeStyle = COLORS[Math.floor((b.t / 220) % COLORS.length)];
        ctx.globalAlpha = life * 0.55;
        ctx.lineWidth = 1 + life * 5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (pts.length) {
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!visible || e.pointerType !== 'mouse') return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (y < 0 || y > r.height) return;
      pts.push({ x, y, t: performance.now() });
      if (pts.length > 80) pts.shift();
      if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      ro.disconnect();
      io.disconnect();
    };
  }, [lowMotion, fine]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
