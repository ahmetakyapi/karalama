'use client';

import { useRef, useEffect, useState } from 'react';
import type { ChatMessage } from '@karalama/shared';
import { useChatStore } from '@/stores/chatStore';
import { useGameStore } from '@/stores/gameStore';
import { getSocket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactionBar } from '@/components/game/EmojiReactions';
import { useProgressStore } from '@/stores/progressStore';

function MessageRow({ msg }: { msg: ChatMessage }) {
  if (msg.type === 'system') {
    return <p className="text-[13px] text-slate-500 text-center py-0.5">{msg.text}</p>;
  }
  if (msg.type === 'correct') {
    return (
      <p className="text-[13px] text-emerald-300 font-medium bg-emerald-500/10 rounded-lg px-2 py-1">
        {msg.text}
      </p>
    );
  }
  if (msg.type === 'close') {
    return (
      <motion.p
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className="text-[13px] text-amber-300 font-medium bg-amber-500/10 rounded-lg px-2.5 py-1.5 border border-amber-500/20 flex items-center gap-1.5"
      >
        <span aria-hidden="true" className="text-base">&#x1F525;</span>
        {msg.text}
      </motion.p>
    );
  }
  return (
    <p className="text-sm break-words">
      <span className="font-medium mr-1" style={{ color: msg.playerColor }}>
        {msg.playerName}:
      </span>
      <span className="text-slate-300">{msg.text}</span>
    </p>
  );
}

/** Message list that keeps the newest line in view. */
function MessageList({ className }: { className?: string }) {
  const { messages } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-live="polite"
      aria-label="Sohbet mesajları"
      className={cn('overflow-y-auto space-y-1.5', className)}
    >
      {messages.length === 0 && (
        <p className="py-2 text-center text-[13px] text-slate-500">Tahminler burada görünecek</p>
      )}
      <AnimatePresence mode="popLayout">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <MessageRow msg={msg} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Guess / chat input. A form, so the phone keyboard's "Git" sends it. */
export function ChatInput({ withSend = false }: { withSend?: boolean }) {
  const { playerId, currentDrawerId, phase, hasGuessedCorrectly } = useGameStore();
  const { currentStreak } = useProgressStore();
  const [text, setText] = useState('');

  const isDrawer = playerId === currentDrawerId;
  const disableInput = isDrawer && phase === 'DRAWING';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    getSocket().emit('chat:message', { text: trimmed });
    setText('');
  };

  return (
    <form onSubmit={handleSend} className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disableInput}
        maxLength={100}
        enterKeyHint="send"
        autoComplete="off"
        aria-label={phase === 'DRAWING' && !isDrawer && !hasGuessedCorrectly ? 'Tahminin' : 'Mesajın'}
        placeholder={
          disableInput
            ? 'Çizim yapıyorsun…'
            : hasGuessedCorrectly
              ? currentStreak > 1
                ? `Doğru bildin! (${currentStreak} seri)`
                : 'Doğru bildin!'
              : 'Tahminini yaz…'
        }
        className={cn(
          'min-w-0 flex-1 px-3 py-2 rounded-lg text-base sm:text-sm',
          'bg-white/[0.03] border border-white/[0.08]',
          'text-white placeholder:text-slate-500',
          'focus:outline-none focus:border-accent-indigo/50',
          'disabled:opacity-40',
          'transition-colors duration-200'
        )}
      />
      {withSend && (
        <button
          type="submit"
          disabled={disableInput || !text.trim()}
          aria-label="Gönder"
          className="flex w-11 shrink-0 items-center justify-center rounded-lg bg-accent-indigo/25 border border-accent-indigo/40 text-indigo-200 transition-opacity disabled:opacity-40"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
          </svg>
        </button>
      )}
    </form>
  );
}

export function ChatPanel() {
  return (
    <div className="flex flex-col h-full glass rounded-xl overflow-hidden">
      <div className="px-3 py-2 border-b border-white/[0.06]">
        <h2 className="text-[13px] font-medium text-slate-400">Sohbet</h2>
      </div>

      <MessageList className="flex-1 p-3" />

      {/* Reactions + Input */}
      <div className="px-2 pt-1.5 border-t border-white/[0.06]">
        <ReactionBar />
      </div>
      <div className="p-2 pt-1">
        <ChatInput />
      </div>
    </div>
  );
}

/**
 * Phones: the chat lives under the canvas, so guessing never means switching
 * away from the drawing. The drawer gets the feed without an input.
 */
export function GuessDock({ showInput = true }: { showInput?: boolean }) {
  return (
    <div className="glass mt-2 flex min-h-[120px] flex-1 flex-col overflow-hidden rounded-xl">
      <MessageList className="min-h-0 flex-1 px-3 py-2" />
      {showInput && (
        <div className="border-t border-white/[0.06] p-2">
          <ChatInput withSend />
        </div>
      )}
    </div>
  );
}
