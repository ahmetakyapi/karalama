'use client';

import { useDrawingStore } from '@/stores/drawingStore';
import { COLOR_PALETTE, BRUSH_SIZES } from '@karalama/shared';
import type { DrawTool } from '@karalama/shared';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const TOOL_GROUPS: { tool: DrawTool; label: string; shortcut: string; icon: JSX.Element }[][] = [
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
    {
      tool: 'eyedropper' as DrawTool,
      label: 'Damlalık',
      shortcut: 'I',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 4l5 5m-5-5L9.5 9.5M15 4l2-2 5 5-2 2M9.5 9.5L4 15v5h5l5.5-5.5M9.5 9.5l5 5" />
        </svg>
      ),
    },
  ],
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

const STABILIZER_OPTIONS = [
  { value: 'off', label: 'Kapalı' },
  { value: 'low', label: 'Hafif' },
  { value: 'medium', label: 'Orta' },
  { value: 'high', label: 'Güçlü' },
] as const;

export function CanvasToolbar() {
  const {
    tool,
    color,
    brushSize,
    recentColors,
    stabilizer,
    setTool,
    setColor,
    setBrushSize,
    setStabilizer,
  } = useDrawingStore();
  const [showColors, setShowColors] = useState(false);
  const [showShapes, setShowShapes] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const handleUndo = () => {
    const fn = (window as unknown as Record<string, unknown>).__canvasUndo;
    if (typeof fn === 'function') fn();
  };
  const handleRedo = () => {
    const fn = (window as unknown as Record<string, unknown>).__canvasRedo;
    if (typeof fn === 'function') fn();
  };
  const handleClear = () => {
    if (!window.confirm('Tüm çizimi silmek istediğine emin misin?')) return;
    const fn = (window as unknown as Record<string, unknown>).__canvasClear;
    if (typeof fn === 'function') fn();
  };
  const handleSavePNG = () => {
    const fn = (window as unknown as Record<string, unknown>).__canvasSavePNG;
    if (typeof fn === 'function') fn();
  };

  const isShapeTool = ['rect', 'circle', 'line', 'filledRect', 'filledCircle'].includes(tool);
  const activeShapeIcon = TOOL_GROUPS[1].find((t) => t.tool === tool);

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2.5 glass rounded-xl mt-2">
      {/* Drawing tools */}
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

      {/* Shapes dropdown */}
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
          className="w-8 h-8 rounded-lg border-2 border-white/20 transition-all hover:border-white/40 relative overflow-hidden"
          style={{ backgroundColor: color }}
          title="Renk seç"
          aria-label="Renk paleti"
        >
          <span className="sr-only">{color}</span>
        </button>
        <AnimatePresence>
          {showColors && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              className="absolute bottom-full left-0 mb-2 p-3 glass rounded-xl z-50 w-[260px]"
            >
              {/* Palette */}
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Palet</p>
              <div className="grid grid-cols-11 gap-1 mb-3">
                {COLOR_PALETTE.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      setShowColors(false);
                    }}
                    className={cn(
                      'w-5 h-5 rounded-md transition-all hover:scale-110 relative',
                      color === c && 'ring-2 ring-white ring-offset-1 ring-offset-bg-primary',
                    )}
                    style={{ backgroundColor: c }}
                    title={`${c} · kısayol: ${i === 9 ? 0 : i + 1}`}
                  />
                ))}
              </div>

              {/* Recent colors */}
              {recentColors.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Son Kullanılan</p>
                  <div className="flex gap-1 mb-3">
                    {recentColors.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setColor(c);
                          setShowColors(false);
                        }}
                        className={cn(
                          'w-5 h-5 rounded-md transition-all hover:scale-110',
                          color === c && 'ring-2 ring-white ring-offset-1 ring-offset-bg-primary',
                        )}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Custom color */}
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Özel Renk</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded-md border border-white/10 bg-transparent cursor-pointer"
                  aria-label="Özel renk seçici"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^#[0-9a-fA-F]{6}$/.test(v)) setColor(v);
                  }}
                  className="flex-1 px-2 py-1 text-xs font-mono bg-white/[0.04] border border-white/10 rounded-md text-white/80 focus:outline-none focus:border-accent-indigo/50"
                  maxLength={7}
                  placeholder="#000000"
                />
              </div>
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
                : 'hover:bg-white/[0.05]',
            )}
            title={`${size}px · [  ]`}
            aria-label={`Fırça ${size} piksel`}
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

      <div className="w-px h-6 bg-white/10" />

      {/* More menu: stabilizer, save PNG */}
      <div className="relative">
        <ToolBtn
          onClick={() => setShowMore(!showMore)}
          label="Daha"
          shortcut=""
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          }
          hasDropdown
        />
        <AnimatePresence>
          {showMore && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              className="absolute bottom-full right-0 mb-2 p-3 glass rounded-xl z-50 w-[240px]"
            >
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Titreme Düzelt</p>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {STABILIZER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStabilizer(opt.value)}
                    className={cn(
                      'py-1.5 rounded-md text-[11px] font-medium transition-all',
                      stabilizer === opt.value
                        ? 'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30'
                        : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:bg-white/[0.06]',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  handleSavePNG();
                  setShowMore(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-medium text-white/80 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
                PNG olarak indir
                <span className="ml-auto text-[10px] text-white/30 font-mono">Ctrl+S</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
          : 'text-white/60 hover:text-white hover:bg-white/[0.05]',
      )}
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {hasDropdown && (
        <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      )}
      {shortcut && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block px-1.5 py-0.5 text-[10px] bg-black/80 text-white/70 rounded whitespace-nowrap pointer-events-none z-50">
          {shortcut}
        </span>
      )}
    </motion.button>
  );
}
