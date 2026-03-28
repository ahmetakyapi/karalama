import { useCallback, useRef, useEffect } from 'react';

type SoundType =
  | 'correctGuess'
  | 'wrongGuess'
  | 'roundEnd'
  | 'gameOver'
  | 'tick'
  | 'playerJoin'
  | 'yourTurn'
  | 'click';

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
  detune = 0,
) {
  const ctx = getCtx();
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
};

export function useSoundEffects() {
  const enabled = useRef(true);

  const play = useCallback((sound: SoundType) => {
    if (!enabled.current) return;
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

// Singleton for use outside React
export function playSfx(sound: SoundType) {
  try {
    SOUNDS[sound]();
  } catch {
    // AudioContext not available
  }
}
