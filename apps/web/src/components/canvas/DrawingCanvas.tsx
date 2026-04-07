'use client';

import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useDrawingStore } from '@/stores/drawingStore';
import { useGameStore } from '@/stores/gameStore';
import { getSocket } from '@/lib/socket';
import { CANVAS_WIDTH, CANVAS_HEIGHT, SHAPE_TOOLS, type DrawStroke, type DrawPoint } from '@karalama/shared';
import { nanoid } from 'nanoid';

function isShapeTool(tool: string): boolean {
  return SHAPE_TOOLS.includes(tool as any);
}

function drawShapeOnCtx(
  ctx: CanvasRenderingContext2D,
  tool: string,
  start: DrawPoint,
  end: DrawPoint,
  color: string,
  size: number
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

// Flood fill algorithm
function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColor: string
) {
  const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const data = imageData.data;

  // Parse fill color
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

  // Don't fill if same color
  if (
    targetR === fillRgb[0] &&
    targetG === fillRgb[1] &&
    targetB === fillRgb[2] &&
    targetA === fillRgb[3]
  ) return;

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

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<DrawPoint[]>([]);
  const strokeHistoryRef = useRef<DrawStroke[]>([]);
  const redoStackRef = useRef<DrawStroke[]>([]);
  const shapeStartRef = useRef<DrawPoint | null>(null);
  const { tool, color, brushSize } = useDrawingStore();

  // Normalized coordinates
  const normalizePoint = useCallback(
    (clientX: number, clientY: number): DrawPoint => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left) / rect.width,
        y: (clientY - rect.top) / rect.height,
      };
    },
    []
  );

  // Draw stroke on canvas
  const drawStroke = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      points: DrawPoint[],
      strokeColor: string,
      strokeSize: number,
      strokeTool: string
    ) => {
      // Shape strokes
      if (isShapeTool(strokeTool) && points.length >= 2) {
        drawShapeOnCtx(ctx, strokeTool, points[0], points[points.length - 1], strokeColor, strokeSize);
        return;
      }

      if (points.length < 2) return;

      ctx.save();
      if (strokeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(points[0].x * CANVAS_WIDTH, points[0].y * CANVAS_HEIGHT);

      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const midX = ((prev.x + curr.x) / 2) * CANVAS_WIDTH;
        const midY = ((prev.y + curr.y) / 2) * CANVAS_HEIGHT;
        ctx.quadraticCurveTo(
          prev.x * CANVAS_WIDTH,
          prev.y * CANVAS_HEIGHT,
          midX,
          midY
        );
      }

      const last = points[points.length - 1];
      ctx.lineTo(last.x * CANVAS_WIDTH, last.y * CANVAS_HEIGHT);
      ctx.stroke();
      ctx.restore();
    },
    []
  );

  // Redraw all strokes
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
        // Replay fill: we need to apply it after prior strokes
        if (stroke.points.length > 0) {
          floodFill(
            ctx,
            stroke.points[0].x * CANVAS_WIDTH,
            stroke.points[0].y * CANVAS_HEIGHT,
            stroke.color
          );
        }
      } else {
        drawStroke(ctx, stroke.points, stroke.color, stroke.size, stroke.tool);
      }
    }
  }, [drawStroke]);

  // Initialize canvas
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

  // Pointer handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const overlay = overlayRef.current;
      if (!overlay) return;

      overlay.setPointerCapture(e.pointerId);
      const point = normalizePoint(e.clientX, e.clientY);

      // Fill tool - immediate action
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
        return;
      }

      isDrawingRef.current = true;

      if (isShapeTool(tool)) {
        shapeStartRef.current = point;
      } else {
        currentStrokeRef.current = [point];
      }
    },
    [normalizePoint, tool, color]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();

      const point = normalizePoint(e.clientX, e.clientY);
      const overlay = overlayRef.current;
      if (!overlay) return;
      const ctx = overlay.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (isShapeTool(tool) && shapeStartRef.current) {
        drawShapeOnCtx(ctx, tool, shapeStartRef.current, point, color, brushSize);
      } else {
        currentStrokeRef.current.push(point);
        drawStroke(
          ctx,
          currentStrokeRef.current,
          tool === 'eraser' ? '#000000' : color,
          brushSize,
          tool
        );
      }
    },
    [normalizePoint, drawStroke, tool, color, brushSize]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      // Clear overlay
      const overlay = overlayRef.current;
      if (overlay) {
        const ctx = overlay.getContext('2d');
        ctx?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      let stroke: DrawStroke;

      if (isShapeTool(tool) && shapeStartRef.current) {
        const endPoint = normalizePoint(e.clientX, e.clientY);
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
      redoStackRef.current = []; // Clear redo on new action
      redrawAll();

      getSocket().emit('draw:stroke', stroke);
      currentStrokeRef.current = [];
    },
    [tool, color, brushSize, redrawAll, normalizePoint]
  );

  // Undo
  const undo = useCallback(() => {
    const popped = strokeHistoryRef.current.pop();
    if (popped) {
      redoStackRef.current.push(popped);
    }
    redrawAll();
    getSocket().emit('draw:undo');
  }, [redrawAll]);

  // Redo
  const redo = useCallback(() => {
    const stroke = redoStackRef.current.pop();
    if (stroke) {
      strokeHistoryRef.current.push(stroke);
      redrawAll();
      getSocket().emit('draw:stroke', stroke);
    }
  }, [redrawAll]);

  const clear = useCallback(() => {
    strokeHistoryRef.current = [];
    redoStackRef.current = [];
    redrawAll();
    getSocket().emit('draw:clear');
  }, [redrawAll]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        redo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      const store = useDrawingStore.getState();
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
          store.setTool('rect');
          break;
        case 'c':
          if (!e.metaKey && !e.ctrlKey) store.setTool('circle');
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Custom cursor based on brush size/color
  const cursorStyle = useMemo(() => {
    if (tool === 'fill') return 'crosshair';

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
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
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

  // Expose undo/clear/redo
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__canvasUndo = undo;
    (window as unknown as Record<string, unknown>).__canvasClear = clear;
    (window as unknown as Record<string, unknown>).__canvasRedo = redo;
  }, [undo, clear, redo]);

  const [zoomed, setZoomed] = useState(false);

  return (
    <div ref={containerRef} className="relative w-full" style={{ aspectRatio: '4/3' }}>
      <div
        className="absolute inset-0 overflow-hidden rounded-xl"
        style={{
          transform: zoomed ? 'scale(1.5)' : 'scale(1)',
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease',
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
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
      {/* Zoom toggle - visible on mobile */}
      <button
        onClick={() => setZoomed((z) => !z)}
        className="absolute top-2 right-2 lg:hidden w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white z-10"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {zoomed ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          )}
        </svg>
      </button>
    </div>
  );
}
