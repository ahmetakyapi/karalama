'use client';

import { useRef, useEffect, useCallback } from 'react';
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

  // Expose undo/clear
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__canvasUndo = undo;
    (window as unknown as Record<string, unknown>).__canvasClear = clear;
  }, [undo, clear]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ aspectRatio: '4/3' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full rounded-xl"
      />
      <canvas
        ref={overlayRef}
        className="absolute inset-0 w-full h-full rounded-xl cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}
