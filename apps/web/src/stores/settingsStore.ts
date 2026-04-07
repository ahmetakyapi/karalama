import { create } from 'zustand';

type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
type FontSize = 'normal' | 'large' | 'xl';

interface SettingsStore {
  colorblindMode: ColorblindMode;
  fontSize: FontSize;
  soundEnabled: boolean;
  setColorblindMode: (mode: ColorblindMode) => void;
  setFontSize: (size: FontSize) => void;
  setSoundEnabled: (enabled: boolean) => void;
}

function loadSettings() {
  if (typeof window === 'undefined') return { colorblindMode: 'none' as ColorblindMode, fontSize: 'normal' as FontSize, soundEnabled: true };
  try {
    const saved = localStorage.getItem('karalama_settings');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { colorblindMode: 'none' as ColorblindMode, fontSize: 'normal' as FontSize, soundEnabled: true };
}

function saveSettings(state: Partial<SettingsStore>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('karalama_settings', JSON.stringify({
      colorblindMode: state.colorblindMode,
      fontSize: state.fontSize,
      soundEnabled: state.soundEnabled,
    }));
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

  setSoundEnabled: (enabled) =>
    set((state) => {
      saveSettings({ ...state, soundEnabled: enabled });
      return { soundEnabled: enabled };
    }),
}));
