'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { CANVAS_WIDTH, CANVAS_HEIGHT, SHAPE_TOOLS, type DrawStroke, type DrawPoint } from '@karalama/shared';

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

function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColor: string
) {
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
      // Shape strokes
      if (isShapeTool(tool) && points.length >= 2) {
        drawShapeOnCtx(ctx, tool, points[0], points[points.length - 1], color, size);
        return;
      }

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
      if (stroke.tool === 'fill') {
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
