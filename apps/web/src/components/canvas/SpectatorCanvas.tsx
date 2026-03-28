'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { CANVAS_WIDTH, CANVAS_HEIGHT, type DrawStroke, type DrawPoint } from '@karalama/shared';

export function SpectatorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { drawHistory } = useGameStore();

  const drawStroke = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      points: DrawPoint[],
      color: string,
      size: number,
      tool: string
    ) => {
      if (points.length < 2) return;

      ctx.save();
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (const stroke of drawHistory) {
      drawStroke(ctx, stroke.points, stroke.color, stroke.size, stroke.tool);
    }
  }, [drawHistory, drawStroke]);

  return (
    <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full rounded-xl"
      />
    </div>
  );
}
