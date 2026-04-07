'use client';

import { useDrawingStore } from '@/stores/drawingStore';
import { COLOR_PALETTE, BRUSH_SIZES } from '@karalama/shared';
import type { DrawTool } from '@karalama/shared';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const TOOL_GROUPS: { tool: DrawTool; label: string; shortcut: string; icon: JSX.Element }[][] = [
  // Drawing tools
  [
    {
      tool: 'pen',
      label: 'Kalem',
      shortcut: 'B',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
    },
    {
      tool: 'eraser',
      label: 'Silgi',
      shortcut: 'E',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
    {
      tool: 'fill',
      label: 'Dolgu',
      shortcut: 'G',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485" />
        </svg>
      ),
    },
  ],
  // Shape tools
  [
    {
      tool: 'line',
      label: 'Çizgi',
      shortcut: 'L',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <line x1="5" y1="19" x2="19" y2="5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      tool: 'rect',
      label: 'Dikdörtgen',
      shortcut: 'R',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="5" width="18" height="14" rx="1" />
        </svg>
      ),
    },
    {
      tool: 'filledRect',
      label: 'Dolu Dikdörtgen',
      shortcut: '',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="5" width="18" height="14" rx="1" />
        </svg>
      ),
    },
    {
      tool: 'circle',
      label: 'Daire',
      shortcut: 'C',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
    },
    {
      tool: 'filledCircle',
      label: 'Dolu Daire',
      shortcut: '',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
    },
  ],
];

export function CanvasToolbar() {
  const { tool, color, brushSize, setTool, setColor, setBrushSize } =
    useDrawingStore();
  const [showColors, setShowColors] = useState(false);
  const [showShapes, setShowShapes] = useState(false);

  const handleUndo = () => {
    const fn = (window as unknown as Record<string, unknown>).__canvasUndo;
    if (typeof fn === 'function') fn();
  };

  const handleRedo = () => {
    const fn = (window as unknown as Record<string, unknown>).__canvasRedo;
    if (typeof fn === 'function') fn();
  };

  const handleClear = () => {
    const fn = (window as unknown as Record<string, unknown>).__canvasClear;
    if (typeof fn === 'function') fn();
  };

  // Check if current tool is a shape tool
  const isShapeTool = ['rect', 'circle', 'line', 'filledRect', 'filledCircle'].includes(tool);
  const activeShapeIcon = TOOL_GROUPS[1].find(t => t.tool === tool);

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2.5 glass rounded-xl mt-2">
      {/* Drawing tools (pen, eraser, fill) */}
      <div className="flex gap-0.5">
        {TOOL_GROUPS[0].map((t) => (
          <ToolBtn
            key={t.tool}
            active={tool === t.tool}
            onClick={() => setTool(t.tool)}
            label={t.label}
            shortcut={t.shortcut}
            icon={t.icon}
          />
        ))}
      </div>

      <div className="w-px h-6 bg-white/10" />

      {/* Shape tools (dropdown) */}
      <div className="relative">
        <ToolBtn
          active={isShapeTool}
          onClick={() => setShowShapes(!showShapes)}
          label={activeShapeIcon?.label || 'Şekiller'}
          shortcut=""
          icon={
            activeShapeIcon?.icon || (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="5" width="18" height="14" rx="1" />
              </svg>
            )
          }
          hasDropdown
        />
        <AnimatePresence>
          {showShapes && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              className="absolute bottom-full left-0 mb-2 p-1.5 glass rounded-xl z-50 flex gap-0.5"
            >
              {TOOL_GROUPS[1].map((t) => (
                <ToolBtn
                  key={t.tool}
                  active={tool === t.tool}
                  onClick={() => {
                    setTool(t.tool);
                    setShowShapes(false);
                  }}
                  label={t.label}
                  shortcut={t.shortcut}
                  icon={t.icon}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-px h-6 bg-white/10" />

      {/* Color swatch */}
      <div className="relative">
        <button
          onClick={() => setShowColors(!showColors)}
          className="w-8 h-8 rounded-lg border-2 border-white/20 transition-all hover:border-white/40"
          style={{ backgroundColor: color }}
          title="Renk seç"
        />
        <AnimatePresence>
          {showColors && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
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
        </AnimatePresence>
      </div>

      <div className="w-px h-6 bg-white/10" />

      {/* Brush sizes */}
      <div className="flex items-center gap-0.5">
        {BRUSH_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => setBrushSize(size)}
            className={cn(
              'flex items-center justify-center w-7 h-7 rounded-lg transition-all',
              brushSize === size
                ? 'bg-accent-indigo/20 border border-accent-indigo/50'
                : 'hover:bg-white/[0.05]'
            )}
            title={`${size}px`}
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

      {/* Undo / Redo / Clear */}
      <div className="flex gap-0.5">
        <ToolBtn
          onClick={handleUndo}
          label="Geri Al"
          shortcut="Ctrl+Z"
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4" />
            </svg>
          }
        />
        <ToolBtn
          onClick={handleRedo}
          label="İleri Al"
          shortcut="Ctrl+Shift+Z"
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a5 5 0 00-5 5v2M21 10l-4-4M21 10l-4 4" />
            </svg>
          }
        />
        <ToolBtn
          onClick={handleClear}
          label="Temizle"
          shortcut=""
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
        />
      </div>
    </div>
  );
}

function ToolBtn({
  active,
  onClick,
  label,
  shortcut,
  icon,
  hasDropdown,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  shortcut?: string;
  icon?: JSX.Element;
  hasDropdown?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'relative group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
        active
          ? 'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30'
          : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
      )}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {hasDropdown && (
        <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      )}
      {/* Shortcut tooltip */}
      {shortcut && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block px-1.5 py-0.5 text-[10px] bg-black/80 text-white/70 rounded whitespace-nowrap pointer-events-none">
          {shortcut}
        </span>
      )}
    </motion.button>
  );
}
