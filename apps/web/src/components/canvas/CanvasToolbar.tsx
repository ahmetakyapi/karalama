'use client';

import { useDrawingStore } from '@/stores/drawingStore';
import { COLOR_PALETTE, BRUSH_SIZES } from '@karalama/shared';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function CanvasToolbar() {
  const { tool, color, brushSize, setTool, setColor, setBrushSize } =
    useDrawingStore();
  const [showColors, setShowColors] = useState(false);

  const handleUndo = () => {
    const fn = (window as unknown as Record<string, unknown>).__canvasUndo;
    if (typeof fn === 'function') fn();
  };

  const handleClear = () => {
    const fn = (window as unknown as Record<string, unknown>).__canvasClear;
    if (typeof fn === 'function') fn();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 glass rounded-xl mt-2">
      {/* Tools */}
      <div className="flex gap-1">
        <ToolBtn
          active={tool === 'pen'}
          onClick={() => setTool('pen')}
          label="Kalem"
        />
        <ToolBtn
          active={tool === 'eraser'}
          onClick={() => setTool('eraser')}
          label="Silgi"
        />
      </div>

      <div className="w-px h-6 bg-white/10" />

      {/* Color swatch */}
      <div className="relative">
        <button
          onClick={() => setShowColors(!showColors)}
          className="w-8 h-8 rounded-lg border-2 border-white/20 transition-all hover:border-white/40"
          style={{ backgroundColor: color }}
        />
        {showColors && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute bottom-full left-0 mb-2 p-2 glass rounded-xl grid grid-cols-11 gap-1 z-50"
          >
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setShowColors(false);
                }}
                className={cn(
                  'w-6 h-6 rounded-md transition-all hover:scale-110',
                  color === c && 'ring-2 ring-white ring-offset-1 ring-offset-bg-primary'
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </motion.div>
        )}
      </div>

      <div className="w-px h-6 bg-white/10" />

      {/* Brush sizes */}
      <div className="flex items-center gap-1">
        {BRUSH_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => setBrushSize(size)}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg transition-all',
              brushSize === size
                ? 'bg-accent-indigo/20 border border-accent-indigo/50'
                : 'hover:bg-white/[0.05]'
            )}
          >
            <div
              className="rounded-full bg-white"
              style={{
                width: Math.min(size, 20),
                height: Math.min(size, 20),
              }}
            />
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-white/10" />

      {/* Undo / Clear */}
      <div className="flex gap-1">
        <ToolBtn onClick={handleUndo} label="Geri Al" />
        <ToolBtn onClick={handleClear} label="Temizle" />
      </div>
    </div>
  );
}

function ToolBtn({
  active,
  onClick,
  label,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
        active
          ? 'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30'
          : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
      )}
    >
      {label}
    </motion.button>
  );
}
