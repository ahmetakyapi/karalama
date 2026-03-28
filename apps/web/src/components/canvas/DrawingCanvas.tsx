'use client';

import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useDrawingStore } from '@/stores/drawingStore';
import { useGameStore } from '@/stores/gameStore';
import { getSocket } from '@/lib/socket';
import { CANVAS_WIDTH, CANVAS_HEIGHT, type DrawStroke, type DrawPoint } from '@karalama/shared';
import { nanoid } from 'nanoid';

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<DrawPoint[]>([]);
  const strokeHistoryRef = useRef<DrawStroke[]>([]);
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
      drawStroke(ctx, stroke.points, stroke.color, stroke.size, stroke.tool);
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
      isDrawingRef.current = true;
      currentStrokeRef.current = [normalizePoint(e.clientX, e.clientY)];
    },
    [normalizePoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();

      const point = normalizePoint(e.clientX, e.clientY);
      currentStrokeRef.current.push(point);

      // Draw on overlay
      const overlay = overlayRef.current;
      if (!overlay) return;
      const ctx = overlay.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawStroke(
        ctx,
        currentStrokeRef.current,
        tool === 'eraser' ? '#000000' : color,
        brushSize,
        tool
      );
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

      const points = currentStrokeRef.current;
      if (points.length < 2) return;

      const stroke: DrawStroke = {
        id: nanoid(8),
        tool,
        color: tool === 'eraser' ? '#000000' : color,
        size: brushSize,
        points,
      };

      strokeHistoryRef.current.push(stroke);
      redrawAll();

      // Send to server
      getSocket().emit('draw:stroke', stroke);
      currentStrokeRef.current = [];
    },
    [tool, color, brushSize, redrawAll]
  );

  // Undo
  useEffect(() => {
    const handleUndo = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handleUndo);
    return () => window.removeEventListener('keydown', handleUndo);
  }, []);

  const undo = useCallback(() => {
    strokeHistoryRef.current.pop();
    redrawAll();
    getSocket().emit('draw:undo');
  }, [redrawAll]);

  const clear = useCallback(() => {
    strokeHistoryRef.current = [];
    redrawAll();
    getSocket().emit('draw:clear');
  }, [redrawAll]);

  // Custom cursor based on brush size/color
  const cursorStyle = useMemo(() => {
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

  // Expose undo/clear
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__canvasUndo = undo;
    (window as unknown as Record<string, unknown>).__canvasClear = clear;
  }, [undo, clear]);

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
