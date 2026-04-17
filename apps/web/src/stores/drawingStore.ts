import { create } from 'zustand';
import type { DrawTool } from '@karalama/shared';

type StabilizerLevel = 'off' | 'low' | 'medium' | 'high';

interface DrawingStore {
  tool: DrawTool;
  previousTool: DrawTool;
  color: string;
  brushSize: number;
  recentColors: string[];
  zoom: number;
  panX: number;
  panY: number;
  stabilizer: StabilizerLevel;
  pressureEnabled: boolean;
  setTool: (tool: DrawTool) => void;
  setColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;
  setStabilizer: (level: StabilizerLevel) => void;
  setPressureEnabled: (enabled: boolean) => void;
  reset: () => void;
}

const MAX_RECENT = 8;

function loadDrawingPrefs() {
  if (typeof window === 'undefined') {
    return {
      recentColors: [],
      stabilizer: 'low' as StabilizerLevel,
      pressureEnabled: true,
    };
  }
  try {
    const saved = localStorage.getItem('karalama_drawing');
    if (saved) {
      const p = JSON.parse(saved);
      return {
        recentColors: Array.isArray(p.recentColors) ? p.recentColors.slice(0, MAX_RECENT) : [],
        stabilizer: (p.stabilizer as StabilizerLevel) ?? 'low',
        pressureEnabled: p.pressureEnabled ?? true,
      };
    }
  } catch {}
  return {
    recentColors: [] as string[],
    stabilizer: 'low' as StabilizerLevel,
    pressureEnabled: true,
  };
}

function saveDrawingPrefs(state: { recentColors: string[]; stabilizer: StabilizerLevel; pressureEnabled: boolean }) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      'karalama_drawing',
      JSON.stringify({
        recentColors: state.recentColors,
        stabilizer: state.stabilizer,
        pressureEnabled: state.pressureEnabled,
      }),
    );
  } catch {}
}

const initial = loadDrawingPrefs();

export const useDrawingStore = create<DrawingStore>((set, get) => ({
  tool: 'pen',
  previousTool: 'pen',
  color: '#000000',
  brushSize: 8,
  recentColors: initial.recentColors,
  zoom: 1,
  panX: 0,
  panY: 0,
  stabilizer: initial.stabilizer,
  pressureEnabled: initial.pressureEnabled,

  setTool: (tool) =>
    set((state) => ({ tool, previousTool: state.tool !== tool ? state.tool : state.previousTool })),

  setColor: (color) =>
    set((state) => {
      const recentColors = [color, ...state.recentColors.filter((c) => c !== color)].slice(0, MAX_RECENT);
      saveDrawingPrefs({ recentColors, stabilizer: state.stabilizer, pressureEnabled: state.pressureEnabled });
      return { color, tool: state.tool === 'eraser' || state.tool === 'fill' ? 'pen' : state.tool, recentColors };
    }),

  setBrushSize: (brushSize) => set({ brushSize }),

  setZoom: (zoom) => set({ zoom: Math.max(1, Math.min(4, zoom)) }),

  setPan: (panX, panY) => set({ panX, panY }),

  resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),

  setStabilizer: (stabilizer) =>
    set((state) => {
      saveDrawingPrefs({ recentColors: state.recentColors, stabilizer, pressureEnabled: state.pressureEnabled });
      return { stabilizer };
    }),

  setPressureEnabled: (pressureEnabled) =>
    set((state) => {
      saveDrawingPrefs({ recentColors: state.recentColors, stabilizer: state.stabilizer, pressureEnabled });
      return { pressureEnabled };
    }),

  reset: () =>
    set({ tool: 'pen', previousTool: 'pen', color: '#000000', brushSize: 8, zoom: 1, panX: 0, panY: 0 }),
}));
