'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

export function ThemeApplier() {
  const { reduceMotion, contrast, fontFamily } = useSettingsStore();

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle('reduce-motion', reduceMotion);
    html.classList.toggle('high-contrast', contrast === 'high');
    html.classList.toggle('font-dyslexic', fontFamily === 'dyslexic');
  }, [reduceMotion, contrast, fontFamily]);

  return null;
}
