import { create } from 'zustand';

type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
type FontSize = 'normal' | 'large' | 'xl';
type FontFamily = 'default' | 'dyslexic';
type ThemeContrast = 'normal' | 'high';

interface SettingsStore {
  colorblindMode: ColorblindMode;
  fontSize: FontSize;
  fontFamily: FontFamily;
  contrast: ThemeContrast;
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  reduceMotion: boolean;
  showKeyboardHints: boolean;
  setColorblindMode: (mode: ColorblindMode) => void;
  setFontSize: (size: FontSize) => void;
  setFontFamily: (family: FontFamily) => void;
  setContrast: (contrast: ThemeContrast) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setShowKeyboardHints: (enabled: boolean) => void;
}

const DEFAULTS = {
  colorblindMode: 'none' as ColorblindMode,
  fontSize: 'normal' as FontSize,
  fontFamily: 'default' as FontFamily,
  contrast: 'normal' as ThemeContrast,
  soundEnabled: true,
  musicEnabled: false,
  hapticsEnabled: true,
  reduceMotion: false,
  showKeyboardHints: true,
};

function loadSettings() {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const saved = localStorage.getItem('karalama_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULTS, ...parsed };
    }
  } catch {}
  // Honor system reduce-motion as default
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return { ...DEFAULTS, reduceMotion: true };
  }
  return DEFAULTS;
}

function saveSettings(state: Partial<SettingsStore>) {
  if (typeof window === 'undefined') return;
  try {
    const data = {
      colorblindMode: state.colorblindMode,
      fontSize: state.fontSize,
      fontFamily: state.fontFamily,
      contrast: state.contrast,
      soundEnabled: state.soundEnabled,
      musicEnabled: state.musicEnabled,
      hapticsEnabled: state.hapticsEnabled,
      reduceMotion: state.reduceMotion,
      showKeyboardHints: state.showKeyboardHints,
    };
    localStorage.setItem('karalama_settings', JSON.stringify(data));
  } catch {}
}

const initial = loadSettings();

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...initial,

  setColorblindMode: (mode) =>
    set((state) => {
      saveSettings({ ...state, colorblindMode: mode });
      return { colorblindMode: mode };
    }),

  setFontSize: (size) =>
    set((state) => {
      saveSettings({ ...state, fontSize: size });
      return { fontSize: size };
    }),

  setFontFamily: (family) =>
    set((state) => {
      saveSettings({ ...state, fontFamily: family });
      return { fontFamily: family };
    }),

  setContrast: (contrast) =>
    set((state) => {
      saveSettings({ ...state, contrast });
      return { contrast };
    }),

  setSoundEnabled: (enabled) =>
    set((state) => {
      saveSettings({ ...state, soundEnabled: enabled });
      return { soundEnabled: enabled };
    }),

  setMusicEnabled: (enabled) =>
    set((state) => {
      saveSettings({ ...state, musicEnabled: enabled });
      return { musicEnabled: enabled };
    }),

  setHapticsEnabled: (enabled) =>
    set((state) => {
      saveSettings({ ...state, hapticsEnabled: enabled });
      return { hapticsEnabled: enabled };
    }),

  setReduceMotion: (enabled) =>
    set((state) => {
      saveSettings({ ...state, reduceMotion: enabled });
      return { reduceMotion: enabled };
    }),

  setShowKeyboardHints: (enabled) =>
    set((state) => {
      saveSettings({ ...state, showKeyboardHints: enabled });
      return { showKeyboardHints: enabled };
    }),
}));
