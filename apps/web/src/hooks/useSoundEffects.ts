import { useCallback, useRef, useEffect } from 'react';

type SoundType =
  | 'correctGuess'
  | 'wrongGuess'
  | 'roundEnd'
  | 'gameOver'
  | 'tick'
  | 'tickUrgent'
  | 'playerJoin'
  | 'yourTurn'
  | 'click'
  | 'levelUp'
  | 'achievement'
  | 'drawStart'
  | 'eraserSwipe'
  | 'undo'
  | 'shareSuccess';

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } catch {
    return null;
  }
  return audioCtx;
}

function settingsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem('karalama_settings');
    if (!raw) return true;
    const p = JSON.parse(raw);
    return p?.soundEnabled !== false;
  } catch {
    return true;
  }
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
  detune = 0,
) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playSequence(
  notes: Array<{ freq: number; delay: number; duration?: number; type?: OscillatorType; volume?: number }>,
) {
  for (const n of notes) {
    setTimeout(() => {
      playTone(n.freq, n.duration ?? 0.15, n.type ?? 'sine', n.volume ?? 0.12);
    }, n.delay);
  }
}

function playNoiseBurst(duration: number, volume = 0.08) {
  const ctx = getCtx();
  if (!ctx) return;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start();
  src.stop(ctx.currentTime + duration);
}

const SOUNDS: Record<SoundType, () => void> = {
  correctGuess: () => {
    playSequence([
      { freq: 523, delay: 0, duration: 0.1 },
      { freq: 659, delay: 80, duration: 0.1 },
      { freq: 784, delay: 160, duration: 0.2 },
    ]);
  },
  wrongGuess: () => {
    playTone(200, 0.15, 'square', 0.06);
  },
  roundEnd: () => {
    playSequence([
      { freq: 440, delay: 0, duration: 0.12 },
      { freq: 550, delay: 100, duration: 0.12 },
      { freq: 660, delay: 200, duration: 0.12 },
      { freq: 880, delay: 300, duration: 0.3 },
    ]);
  },
  gameOver: () => {
    playSequence([
      { freq: 392, delay: 0, duration: 0.2, volume: 0.15 },
      { freq: 523, delay: 150, duration: 0.2, volume: 0.15 },
      { freq: 659, delay: 300, duration: 0.2, volume: 0.15 },
      { freq: 784, delay: 450, duration: 0.15, volume: 0.15 },
      { freq: 1047, delay: 600, duration: 0.4, volume: 0.18 },
    ]);
  },
  tick: () => {
    playTone(880, 0.05, 'sine', 0.04);
  },
  tickUrgent: () => {
    playTone(1100, 0.06, 'square', 0.07);
  },
  playerJoin: () => {
    playSequence([
      { freq: 600, delay: 0, duration: 0.08 },
      { freq: 800, delay: 70, duration: 0.12 },
    ]);
  },
  yourTurn: () => {
    playSequence([
      { freq: 523, delay: 0, duration: 0.15, type: 'triangle' },
      { freq: 659, delay: 120, duration: 0.15, type: 'triangle' },
      { freq: 784, delay: 240, duration: 0.15, type: 'triangle' },
      { freq: 1047, delay: 360, duration: 0.3, type: 'triangle', volume: 0.15 },
    ]);
  },
  click: () => {
    playTone(600, 0.04, 'sine', 0.06);
  },
  levelUp: () => {
    playSequence([
      { freq: 523, delay: 0, duration: 0.12, type: 'triangle', volume: 0.14 },
      { freq: 659, delay: 90, duration: 0.12, type: 'triangle', volume: 0.14 },
      { freq: 784, delay: 180, duration: 0.12, type: 'triangle', volume: 0.14 },
      { freq: 1047, delay: 270, duration: 0.22, type: 'triangle', volume: 0.16 },
      { freq: 1319, delay: 450, duration: 0.3, type: 'sine', volume: 0.14 },
    ]);
  },
  achievement: () => {
    playSequence([
      { freq: 784, delay: 0, duration: 0.1, type: 'sine', volume: 0.13 },
      { freq: 988, delay: 90, duration: 0.12, type: 'sine', volume: 0.13 },
      { freq: 1318, delay: 210, duration: 0.25, type: 'sine', volume: 0.14 },
    ]);
  },
  drawStart: () => {
    playTone(420, 0.03, 'sine', 0.03);
  },
  eraserSwipe: () => {
    playNoiseBurst(0.08, 0.05);
  },
  undo: () => {
    playSequence([
      { freq: 800, delay: 0, duration: 0.05, volume: 0.05 },
      { freq: 600, delay: 30, duration: 0.06, volume: 0.05 },
    ]);
  },
  shareSuccess: () => {
    playSequence([
      { freq: 660, delay: 0, duration: 0.1, volume: 0.1 },
      { freq: 880, delay: 80, duration: 0.14, volume: 0.11 },
      { freq: 1175, delay: 180, duration: 0.2, volume: 0.12 },
    ]);
  },
};

export function useSoundEffects() {
  const enabled = useRef(true);

  const play = useCallback((sound: SoundType) => {
    if (!enabled.current) return;
    if (!settingsEnabled()) return;
    try {
      SOUNDS[sound]();
    } catch {
      // AudioContext not available
    }
  }, []);

  const toggle = useCallback(() => {
    enabled.current = !enabled.current;
    return enabled.current;
  }, []);

  return { play, toggle, enabled };
}

// Singleton for use outside React (respects user sound setting)
export function playSfx(sound: SoundType) {
  if (!settingsEnabled()) return;
  try {
    SOUNDS[sound]();
  } catch {
    // AudioContext not available
  }
}
