'use client';

import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useDrawingStore } from '@/stores/drawingStore';
import { getSocket } from '@/lib/socket';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLOR_PALETTE,
  SHAPE_TOOLS,
  type DrawStroke,
  type DrawPoint,
  type DrawTool,
} from '@karalama/shared';
import { nanoid } from 'nanoid';
import { haptic } from '@/lib/haptics';
import { playSfx } from '@/hooks/useSoundEffects';

function isShapeTool(tool: string): boolean {
  return SHAPE_TOOLS.includes(tool as any);
}

function constrainShapePoint(start: DrawPoint, end: DrawPoint, tool: string): DrawPoint {
  // Shift: make rect/filledRect square, circle/filledCircle perfectly round,
  // and snap lines to 0°/45°/90°
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (tool === 'rect' || tool === 'filledRect' || tool === 'circle' || tool === 'filledCircle') {
    const size = Math.max(Math.abs(dx), Math.abs(dy));
    return {
      x: start.x + Math.sign(dx || 1) * size,
      y: start.y + Math.sign(dy || 1) * size,
    };
  }

  if (tool === 'line') {
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    // Horizontal, vertical, or 45°
    if (absDx > absDy * 2) {
      return { x: end.x, y: start.y }; // horizontal
    }
    if (absDy > absDx * 2) {
      return { x: start.x, y: end.y }; // vertical
    }
    const size = Math.min(absDx, absDy);
    return {
      x: start.x + Math.sign(dx || 1) * size,
      y: start.y + Math.sign(dy || 1) * size,
    };
  }

  return end;
}

function drawShapeOnCtx(
  ctx: CanvasRenderingContext2D,
  tool: string,
  start: DrawPoint,
  end: DrawPoint,
  color: string,
  size: number,
) {
  const x1 = start.x * CANVAS_WIDTH;
  const y1 = start.y * CANVAS_HEIGHT;
  const x2 = end.x * CANVAS_WIDTH;
  const y2 = end.y * CANVAS_HEIGHT;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (tool) {
    case 'rect':
      ctx.strokeRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
      break;
    case 'filledRect':
      ctx.fillRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
      break;
    case 'circle': {
      const rx = Math.abs(x2 - x1) / 2;
      const ry = Math.abs(y2 - y1) / 2;
      const cx = Math.min(x1, x2) + rx;
      const cy = Math.min(y1, y2) + ry;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'filledCircle': {
      const rx2 = Math.abs(x2 - x1) / 2;
      const ry2 = Math.abs(y2 - y1) / 2;
      const cx2 = Math.min(x1, x2) + rx2;
      const cy2 = Math.min(y1, y2) + ry2;
      ctx.beginPath();
      ctx.ellipse(cx2, cy2, rx2, ry2, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'line':
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      break;
  }
  ctx.restore();
}

function floodFill(ctx: CanvasRenderingContext2D, startX: number, startY: number, fillColor: string) {
  const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const data = imageData.data;

  const temp = document.createElement('canvas');
  temp.width = 1;
  temp.height = 1;
  const tempCtx = temp.getContext('2d')!;
  tempCtx.fillStyle = fillColor;
  tempCtx.fillRect(0, 0, 1, 1);
  const fillRgb = tempCtx.getImageData(0, 0, 1, 1).data;

  const sx = Math.floor(startX);
  const sy = Math.floor(startY);
  if (sx < 0 || sx >= CANVAS_WIDTH || sy < 0 || sy >= CANVAS_HEIGHT) return;

  const startIdx = (sy * CANVAS_WIDTH + sx) * 4;
  const targetR = data[startIdx];
  const targetG = data[startIdx + 1];
  const targetB = data[startIdx + 2];
  const targetA = data[startIdx + 3];

  if (
    targetR === fillRgb[0] &&
    targetG === fillRgb[1] &&
    targetB === fillRgb[2] &&
    targetA === fillRgb[3]
  )
    return;

  const tolerance = 32;
  function colorMatch(idx: number): boolean {
    return (
      Math.abs(data[idx] - targetR) <= tolerance &&
      Math.abs(data[idx + 1] - targetG) <= tolerance &&
      Math.abs(data[idx + 2] - targetB) <= tolerance &&
      Math.abs(data[idx + 3] - targetA) <= tolerance
    );
  }

  const stack: [number, number][] = [[sx, sy]];
  const visited = new Uint8Array(CANVAS_WIDTH * CANVAS_HEIGHT);

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    const key = y * CANVAS_WIDTH + x;
    if (visited[key]) continue;
    const idx = key * 4;
    if (!colorMatch(idx)) continue;

    visited[key] = 1;
    data[idx] = fillRgb[0];
    data[idx + 1] = fillRgb[1];
    data[idx + 2] = fillRgb[2];
    data[idx + 3] = 255;

    if (x > 0) stack.push([x - 1, y]);
    if (x < CANVAS_WIDTH - 1) stack.push([x + 1, y]);
    if (y > 0) stack.push([x, y - 1]);
    if (y < CANVAS_HEIGHT - 1) stack.push([x, y + 1]);
  }

  ctx.putImageData(imageData, 0, 0);
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

const STABILIZER_WINDOW: Record<string, number> = { off: 1, low: 3, medium: 6, high: 10 };

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<DrawPoint[]>([]);
  const rawStrokeRef = useRef<DrawPoint[]>([]);
  const strokeHistoryRef = useRef<DrawStroke[]>([]);
  const redoStackRef = useRef<DrawStroke[]>([]);
  const shapeStartRef = useRef<DrawPoint | null>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const spaceHeldRef = useRef(false);
  const shiftHeldRef = useRef(false);

  const {
    tool,
    color,
    brushSize,
    zoom,
    panX,
    panY,
    stabilizer,
    pressureEnabled,
    setTool,
    setColor,
    setBrushSize,
    setZoom,
    setPan,
    resetView,
  } = useDrawingStore();

  const normalizePoint = useCallback((clientX: number, clientY: number): DrawPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  }, []);

  // Stabilizer: apply rolling-average smoothing to incoming points
  const smoothPoint = useCallback(
    (raw: DrawPoint): DrawPoint => {
      const window = STABILIZER_WINDOW[stabilizer] ?? 1;
      rawStrokeRef.current.push(raw);
      if (rawStrokeRef.current.length > 40) rawStrokeRef.current.shift();

      if (window <= 1) return raw;

      const recent = rawStrokeRef.current.slice(-window);
      let sx = 0;
      let sy = 0;
      let sp = 0;
      for (const p of recent) {
        sx += p.x;
        sy += p.y;
        sp += p.pressure ?? 0.5;
      }
      return {
        x: sx / recent.length,
        y: sy / recent.length,
        pressure: sp / recent.length,
      };
    },
    [stabilizer],
  );

  const drawStroke = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      points: DrawPoint[],
      strokeColor: string,
      strokeSize: number,
      strokeTool: string,
    ) => {
      if (isShapeTool(strokeTool) && points.length >= 2) {
        drawShapeOnCtx(
          ctx,
          strokeTool,
          points[0],
          points[points.length - 1],
          strokeColor,
          strokeSize,
        );
        return;
      }

      if (points.length < 2) return;

      ctx.save();
      if (strokeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Pressure-aware rendering: split into segments and vary width
      if (pressureEnabled && strokeTool === 'pen') {
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          const p = curr.pressure ?? 0.5;
          const w = strokeSize * (0.55 + p * 0.9);
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(prev.x * CANVAS_WIDTH, prev.y * CANVAS_HEIGHT);
          const midX = ((prev.x + curr.x) / 2) * CANVAS_WIDTH;
          const midY = ((prev.y + curr.y) / 2) * CANVAS_HEIGHT;
          ctx.quadraticCurveTo(prev.x * CANVAS_WIDTH, prev.y * CANVAS_HEIGHT, midX, midY);
          ctx.lineTo(curr.x * CANVAS_WIDTH, curr.y * CANVAS_HEIGHT);
          ctx.stroke();
        }
      } else {
        ctx.lineWidth = strokeSize;
        ctx.beginPath();
        ctx.moveTo(points[0].x * CANVAS_WIDTH, points[0].y * CANVAS_HEIGHT);
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          const midX = ((prev.x + curr.x) / 2) * CANVAS_WIDTH;
          const midY = ((prev.y + curr.y) / 2) * CANVAS_HEIGHT;
          ctx.quadraticCurveTo(prev.x * CANVAS_WIDTH, prev.y * CANVAS_HEIGHT, midX, midY);
        }
        const last = points[points.length - 1];
        ctx.lineTo(last.x * CANVAS_WIDTH, last.y * CANVAS_HEIGHT);
        ctx.stroke();
      }

      ctx.restore();
    },
    [pressureEnabled],
  );

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (const stroke of strokeHistoryRef.current) {
      if (stroke.tool === 'fill') {
        if (stroke.points.length > 0) {
          floodFill(ctx, stroke.points[0].x * CANVAS_WIDTH, stroke.points[0].y * CANVAS_HEIGHT, stroke.color);
        }
      } else {
        drawStroke(ctx, stroke.points, stroke.color, stroke.size, stroke.tool);
      }
    }
  }, [drawStroke]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    overlay.width = CANVAS_WIDTH;
    overlay.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }, []);

  // Eyedropper
  const eyedropAt = useCallback(
    (point: DrawPoint) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const px = Math.floor(point.x * CANVAS_WIDTH);
      const py = Math.floor(point.y * CANVAS_HEIGHT);
      try {
        const d = ctx.getImageData(px, py, 1, 1).data;
        const hex = rgbToHex(d[0], d[1], d[2]);
        setColor(hex);
        setTool('pen');
        haptic('select');
      } catch {}
    },
    [setColor, setTool],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const overlay = overlayRef.current;
      if (!overlay) return;
      overlay.setPointerCapture(e.pointerId);
      const point = normalizePoint(e.clientX, e.clientY);

      // Pan on space-hold OR middle mouse OR current tool === 'hand'
      if (spaceHeldRef.current || e.button === 1) {
        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX, y: e.clientY, panX, panY };
        return;
      }

      // Eyedropper
      if (tool === ('eyedropper' as DrawTool)) {
        eyedropAt(point);
        return;
      }

      if (tool === 'fill') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        floodFill(ctx, point.x * CANVAS_WIDTH, point.y * CANVAS_HEIGHT, color);
        const stroke: DrawStroke = {
          id: nanoid(8),
          tool: 'fill',
          color,
          size: 0,
          points: [point],
        };
        strokeHistoryRef.current.push(stroke);
        redoStackRef.current = [];
        getSocket().emit('draw:stroke', stroke);
        haptic('tap');
        return;
      }

      isDrawingRef.current = true;
      rawStrokeRef.current = [];

      const pressurePoint = { ...point, pressure: e.pressure > 0 ? e.pressure : 0.5 };

      if (isShapeTool(tool)) {
        shapeStartRef.current = pressurePoint;
      } else {
        currentStrokeRef.current = [pressurePoint];
      }
      playSfx('drawStart');
    },
    [normalizePoint, tool, color, panX, panY, eyedropAt],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const overlay = overlayRef.current;
      if (!overlay) return;

      if (isPanningRef.current && panStartRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        setPan(panStartRef.current.panX + dx, panStartRef.current.panY + dy);
        return;
      }

      if (!isDrawingRef.current) return;
      e.preventDefault();

      const raw = normalizePoint(e.clientX, e.clientY);
      const smooth = smoothPoint({ ...raw, pressure: e.pressure > 0 ? e.pressure : 0.5 });

      const ctx = overlay.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (isShapeTool(tool) && shapeStartRef.current) {
        const end = shiftHeldRef.current ? constrainShapePoint(shapeStartRef.current, raw, tool) : raw;
        drawShapeOnCtx(ctx, tool, shapeStartRef.current, end, color, brushSize);
      } else {
        currentStrokeRef.current.push(smooth);
        drawStroke(
          ctx,
          currentStrokeRef.current,
          tool === 'eraser' ? '#000000' : color,
          brushSize,
          tool,
        );
      }
    },
    [normalizePoint, drawStroke, tool, color, brushSize, setPan, smoothPoint],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        panStartRef.current = null;
        return;
      }
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      const overlay = overlayRef.current;
      if (overlay) {
        const ctx = overlay.getContext('2d');
        ctx?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      let stroke: DrawStroke;

      if (isShapeTool(tool) && shapeStartRef.current) {
        const rawEnd = normalizePoint(e.clientX, e.clientY);
        const endPoint = shiftHeldRef.current
          ? constrainShapePoint(shapeStartRef.current, rawEnd, tool)
          : rawEnd;
        stroke = {
          id: nanoid(8),
          tool,
          color,
          size: brushSize,
          points: [shapeStartRef.current, endPoint],
        };
        shapeStartRef.current = null;
      } else {
        const points = currentStrokeRef.current;
        if (points.length < 2) return;
        stroke = {
          id: nanoid(8),
          tool,
          color: tool === 'eraser' ? '#000000' : color,
          size: brushSize,
          points,
        };
      }

      strokeHistoryRef.current.push(stroke);
      redoStackRef.current = [];
      redrawAll();
      getSocket().emit('draw:stroke', stroke);
      currentStrokeRef.current = [];
      rawStrokeRef.current = [];
    },
    [tool, color, brushSize, redrawAll, normalizePoint],
  );

  const undo = useCallback(() => {
    const popped = strokeHistoryRef.current.pop();
    if (popped) {
      redoStackRef.current.push(popped);
      playSfx('undo');
      haptic('tap');
    }
    redrawAll();
    getSocket().emit('draw:undo');
  }, [redrawAll]);

  const redo = useCallback(() => {
    const stroke = redoStackRef.current.pop();
    if (stroke) {
      strokeHistoryRef.current.push(stroke);
      redrawAll();
      getSocket().emit('draw:stroke', stroke);
      haptic('tap');
    }
  }, [redrawAll]);

  const clear = useCallback(() => {
    strokeHistoryRef.current = [];
    redoStackRef.current = [];
    redrawAll();
    getSocket().emit('draw:clear');
    haptic('warn');
  }, [redrawAll]);

  // Save current canvas as PNG
  const savePNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const link = document.createElement('a');
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.download = `karalama-${stamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      playSfx('shareSuccess');
    } catch {}
  }, []);

  // Keyboard shortcuts (enhanced)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Shift') shiftHeldRef.current = true;
      if (e.code === 'Space') {
        spaceHeldRef.current = true;
        e.preventDefault();
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        redo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        savePNG();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        resetView();
        return;
      }

      const store = useDrawingStore.getState();

      // Number keys 1-0 for palette colors
      const numMatch = /^[0-9]$/.test(e.key);
      if (numMatch && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const idx = e.key === '0' ? 9 : parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < COLOR_PALETTE.length) {
          store.setColor(COLOR_PALETTE[idx]);
          return;
        }
      }

      // Brush size
      if (e.key === '[') {
        const sizes = [2, 4, 8, 16, 30];
        const idx = sizes.indexOf(store.brushSize);
        if (idx > 0) store.setBrushSize(sizes[idx - 1]);
        return;
      }
      if (e.key === ']') {
        const sizes = [2, 4, 8, 16, 30];
        const idx = sizes.indexOf(store.brushSize);
        if (idx >= 0 && idx < sizes.length - 1) store.setBrushSize(sizes[idx + 1]);
        return;
      }

      // Zoom
      if (e.key === '+' || e.key === '=') {
        store.setZoom(zoom + 0.25);
        return;
      }
      if (e.key === '-' || e.key === '_') {
        store.setZoom(zoom - 0.25);
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'b':
          store.setTool('pen');
          break;
        case 'e':
          store.setTool('eraser');
          break;
        case 'g':
          store.setTool('fill');
          break;
        case 'l':
          store.setTool('line');
          break;
        case 'r':
          if (!e.metaKey && !e.ctrlKey) store.setTool('rect');
          break;
        case 'c':
          if (!e.metaKey && !e.ctrlKey) store.setTool('circle');
          break;
        case 'i':
          store.setTool('eyedropper' as DrawTool);
          break;
        case 'h':
          // Hand: toggle space-hold mode
          spaceHeldRef.current = !spaceHeldRef.current;
          break;
        case 'x': {
          // Swap to previous tool
          const prev = store.previousTool;
          store.setTool(prev);
          break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') shiftHeldRef.current = false;
      if (e.code === 'Space') spaceHeldRef.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [undo, redo, savePNG, resetView, zoom]);

  // Wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const delta = -e.deltaY * 0.002;
      useDrawingStore.getState().setZoom(zoom + delta);
    };
    container.addEventListener('wheel', handler, { passive: false });
    return () => container.removeEventListener('wheel', handler);
  }, [zoom]);

  const cursorStyle = useMemo(() => {
    if (typeof document === 'undefined') return 'crosshair';
    if (spaceHeldRef.current) return 'grab';
    if (tool === 'fill') return 'crosshair';
    if ((tool as string) === 'eyedropper') return 'crosshair';

    const size = Math.max(8, brushSize * 1.5);
    const half = size / 2;
    const c = document.createElement('canvas');
    c.width = size + 2;
    c.height = size + 2;
    const ctx = c.getContext('2d');
    if (!ctx) return 'crosshair';
    ctx.beginPath();
    ctx.arc(half + 1, half + 1, half, 0, Math.PI * 2);
    if (tool === 'eraser') {
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      ctx.fillStyle = color + 'aa';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    return `url(${c.toDataURL()}) ${half + 1} ${half + 1}, crosshair`;
  }, [tool, color, brushSize]);

  // Expose undo/clear/redo/save/zoom to toolbar
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__canvasUndo = undo;
    (window as unknown as Record<string, unknown>).__canvasClear = clear;
    (window as unknown as Record<string, unknown>).__canvasRedo = redo;
    (window as unknown as Record<string, unknown>).__canvasSavePNG = savePNG;
    (window as unknown as Record<string, unknown>).__canvasResetView = resetView;
  }, [undo, clear, redo, savePNG, resetView]);

  const [showHelp, setShowHelp] = useState(false);

  return (
    <div ref={containerRef} className="relative w-full" style={{ aspectRatio: '4/3' }}>
      <div
        className="absolute inset-0 overflow-hidden rounded-xl"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDrawingRef.current ? 'none' : 'transform 0.2s ease',
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <canvas
          ref={overlayRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: cursorStyle }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>

      {/* Zoom badge / reset */}
      {zoom !== 1 || panX !== 0 || panY !== 0 ? (
        <button
          onClick={() => resetView()}
          className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-[11px] font-mono text-white/70 hover:text-white hover:bg-black/80 transition-all z-10"
          title="Görünümü sıfırla (Ctrl+0)"
        >
          {Math.round(zoom * 100)}% · sıfırla
        </button>
      ) : null}

      {/* Mobile zoom in/out */}
      <div className="absolute top-2 right-2 lg:hidden flex flex-col gap-1 z-10">
        <button
          onClick={() => setZoom(zoom + 0.25)}
          className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
          aria-label="Yakınlaştır"
        >
          +
        </button>
        <button
          onClick={() => setZoom(zoom - 0.25)}
          className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
          aria-label="Uzaklaştır"
        >
          −
        </button>
      </div>

      {/* Keyboard help toggle */}
      <button
        onClick={() => setShowHelp((v) => !v)}
        className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 hidden lg:flex items-center justify-center text-white/60 hover:text-white z-10"
        aria-label="Klavye kısayolları"
        title="Klavye kısayolları"
      >
        <span className="text-[10px] font-bold">?</span>
      </button>

      {showHelp && (
        <div className="absolute bottom-12 right-2 hidden lg:block z-20 w-64 p-3 rounded-xl glass text-[11px] text-white/80 space-y-1.5">
          <p className="font-bold text-white/90 mb-2">Klavye Kısayolları</p>
          <div className="flex justify-between"><span>Kalem</span><kbd>B</kbd></div>
          <div className="flex justify-between"><span>Silgi</span><kbd>E</kbd></div>
          <div className="flex justify-between"><span>Dolgu</span><kbd>G</kbd></div>
          <div className="flex justify-between"><span>Çizgi</span><kbd>L</kbd></div>
          <div className="flex justify-between"><span>Dikdörtgen</span><kbd>R</kbd></div>
          <div className="flex justify-between"><span>Daire</span><kbd>C</kbd></div>
          <div className="flex justify-between"><span>Damlalık</span><kbd>I</kbd></div>
          <div className="flex justify-between"><span>Renk</span><kbd>1</kbd>-<kbd>0</kbd></div>
          <div className="flex justify-between"><span>Fırça ±</span><kbd>[</kbd> <kbd>]</kbd></div>
          <div className="flex justify-between"><span>Düz çizgi</span><kbd>⇧ Shift</kbd></div>
          <div className="flex justify-between"><span>Taşı (pan)</span><kbd>Space</kbd></div>
          <div className="flex justify-between"><span>Yakınlaştır</span><kbd>+</kbd> / <kbd>-</kbd></div>
          <div className="flex justify-between"><span>Geri al</span><kbd>Ctrl</kbd>+<kbd>Z</kbd></div>
          <div className="flex justify-between"><span>İleri al</span><kbd>Ctrl</kbd>+<kbd>⇧</kbd>+<kbd>Z</kbd></div>
          <div className="flex justify-between"><span>PNG indir</span><kbd>Ctrl</kbd>+<kbd>S</kbd></div>
          <div className="flex justify-between"><span>Önceki araç</span><kbd>X</kbd></div>
        </div>
      )}
    </div>
  );
}
