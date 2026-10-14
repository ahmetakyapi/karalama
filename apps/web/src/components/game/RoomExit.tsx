'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { useGameStore } from '@/stores/gameStore';
import { useChatStore } from '@/stores/chatStore';
import { isGameRoute } from '@/components/motion/hooks';

/**
 * The socket outlives the room page, so walking back to the landing page used
 * to leave a ghost seat behind. Leaving a room route now really leaves it.
 * (Watches the pathname rather than an unmount so dev double-mounts don't
 * kick the host out of a room they just created.)
 */
export function RoomExit() {
  const pathname = usePathname();
  const prev = useRef(pathname);

  useEffect(() => {
    const was = prev.current;
    prev.current = pathname;
    if (!was || was === pathname || !isGameRoute(was) || isGameRoute(pathname)) return;
    const s = getSocket();
    if (s.connected) s.emit('room:leave');
    useGameStore.getState().leaveRoom();
    useChatStore.getState().clear();
  }, [pathname]);

  return null;
}
