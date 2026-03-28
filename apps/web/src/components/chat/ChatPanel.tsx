'use client';

import { useRef, useEffect, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useGameStore } from '@/stores/gameStore';
import { getSocket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactionBar } from '@/components/game/EmojiReactions';

export function ChatPanel() {
  const { messages } = useChatStore();
  const { playerId, currentDrawerId, phase, hasGuessedCorrectly } =
    useGameStore();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const isDrawer = playerId === currentDrawerId;
  const isPlaying = phase === 'DRAWING';
  const disableInput = isDrawer && isPlaying;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    getSocket().emit('chat:message', { text: trimmed });
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full glass rounded-xl overflow-hidden">
      <div className="px-3 py-2 border-b border-white/[0.06]">
        <h3 className="text-xs font-medium text-white/40">Sohbet</h3>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {msg.type === 'system' ? (
                <p className="text-xs text-white/30 text-center py-0.5">
                  {msg.text}
                </p>
              ) : msg.type === 'correct' ? (
                <p className="text-xs text-emerald-400 font-medium bg-emerald-500/10 rounded-lg px-2 py-1">
                  {msg.text}
                </p>
              ) : msg.type === 'close' ? (
                <p className="text-xs text-amber-400 bg-amber-500/10 rounded-lg px-2 py-1">
                  {msg.text}
                </p>
              ) : (
                <p className="text-sm">
                  <span
                    className="font-medium mr-1"
                    style={{ color: msg.playerColor }}
                  >
                    {msg.playerName}:
                  </span>
                  <span className="text-white/70">{msg.text}</span>
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reactions + Input */}
      <div className="px-2 pt-1.5 border-t border-white/[0.06]">
        <ReactionBar />
      </div>
      <div className="p-2 pt-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disableInput}
          maxLength={100}
          placeholder={
            disableInput
              ? 'Çizim yapıyorsun...'
              : hasGuessedCorrectly
                ? 'Doğru bildin!'
                : 'Tahminini yaz...'
          }
          className={cn(
            'w-full px-3 py-2 rounded-lg text-sm',
            'bg-white/[0.03] border border-white/[0.06]',
            'text-white placeholder:text-white/20',
            'focus:outline-none focus:border-accent-indigo/40',
            'disabled:opacity-40',
            'transition-all duration-200'
          )}
        />
      </div>
    </div>
  );
}
