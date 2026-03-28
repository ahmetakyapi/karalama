'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '@/lib/socket';

const REACTION_EMOJIS = ['👏', '🔥', '😂', '😮', '❤️', '💀'] as const;

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  playerName?: string;
}

let nextId = 0;

/** Floating emoji overlay - place once in GameView */
export function EmojiReactions() {
  const [floating, setFloating] = useState<FloatingEmoji[]>([]);

  useEffect(() => {
    const socket = getSocket();
    const handler = ({ emoji, playerName }: { emoji: string; playerId: string; playerName: string }) => {
      const id = nextId++;
      const x = 20 + Math.random() * 60;
      setFloating((prev) => [...prev.slice(-15), { id, emoji, x, playerName }]);
      setTimeout(() => {
        setFloating((prev) => prev.filter((f) => f.id !== id));
      }, 2000);
    };
    socket.on('chat:reaction', handler);
    return () => { socket.off('chat:reaction', handler); };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {floating.map((f) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 1, y: '80vh', x: `${f.x}vw`, scale: 0.5 }}
            animate={{ opacity: 0, y: '10vh', scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute text-3xl"
          >
            {f.emoji}
            {f.playerName && (
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-medium text-white/50 whitespace-nowrap">
                {f.playerName}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Reaction button bar - place in ChatPanel */
export function ReactionBar() {
  const sendReaction = (emoji: string) => {
    getSocket().emit('chat:reaction', { emoji });
  };

  return (
    <div className="flex items-center gap-1">
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => sendReaction(emoji)}
          className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-xs transition-all hover:scale-110 active:scale-95"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
