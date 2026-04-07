import { create } from 'zustand';
import type { DrawTool } from '@karalama/shared';

interface DrawingStore {
  tool: DrawTool;
  color: string;
  brushSize: number;
  setTool: (tool: DrawTool) => void;
  setColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  reset: () => void;
}

export const useDrawingStore = create<DrawingStore>((set) => ({
  tool: 'pen',
  color: '#000000',
  brushSize: 8,
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color, tool: 'pen' }),
  setBrushSize: (brushSize) => set({ brushSize }),
  reset: () => set({ tool: 'pen', color: '#000000', brushSize: 8 }),
}));
