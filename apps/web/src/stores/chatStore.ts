import { create } from 'zustand';
import type { ChatMessage } from '@karalama/shared';

interface ChatStore {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clear: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages.slice(-200), msg],
    })),
  clear: () => set({ messages: [] }),
}));
