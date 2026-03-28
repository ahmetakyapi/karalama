export interface DrawPoint {
  x: number; // normalized 0-1
  y: number; // normalized 0-1
  pressure?: number;
}

export interface DrawStroke {
  id: string;
  tool: DrawTool;
  color: string;
  size: number;
  points: DrawPoint[];
}

export type DrawTool = 'pen' | 'eraser';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const BRUSH_SIZES = [2, 6, 14, 30] as const;

export const COLOR_PALETTE = [
  // Row 1
  '#000000', '#4b5563', '#ef4444', '#f97316', '#eab308',
  '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  // Row 2
  '#ffffff', '#d1d5db', '#991b1b', '#92400e', '#ca8a04',
  '#4d7c0f', '#166534', '#0e7490', '#1e3a8a', '#4c1d95', '#be185d',
] as const;
