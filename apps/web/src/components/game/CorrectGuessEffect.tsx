'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';

interface GuessNotification {
  id: string;
  playerName: string;
  score: number;
}

export function CorrectGuessEffect() {
  const [notifications, setNotifications] = useState<GuessNotification[]>([]);
  const [flash, setFlash] = useState(false);
  const { guessedPlayerIds, players, playerId } = useGameStore();

  // Listen for new correct guesses
  useEffect(() => {
    if (guessedPlayerIds.length === 0) return;
    const lastId = guessedPlayerIds[guessedPlayerIds.length - 1];
    const player = players[lastId];
    if (!player) return;

    const notif: GuessNotification = {
      id: `${lastId}-${Date.now()}`,
      playerName: player.name,
      score: 0, // We don't have individual score here, shown in scoreboard
    };

    setNotifications(prev => [...prev, notif]);
    setFlash(true);

    const flashTimer = setTimeout(() => setFlash(false), 300);
    const removeTimer = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    }, 2500);

    return () => {
      clearTimeout(flashTimer);
      clearTimeout(removeTimer);
    };
  }, [guessedPlayerIds.length]);

  return (
    <>
      {/* Screen flash on correct guess */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-emerald-400/10 pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      {/* Floating notifications */}
      <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
            >
              <span className="text-lg">&#x2714;</span>
              <span className="text-sm font-semibold text-emerald-300">
                {notif.playerName} bildi!
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
