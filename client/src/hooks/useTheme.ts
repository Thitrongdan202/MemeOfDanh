import { useEffect } from 'react';
import { useSettingsStore, Theme } from '@/stores/settingsStore';

export function useTheme() {
  const { theme, setTheme } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    const apply = (resolved: 'light' | 'dark') => {
      root.setAttribute('data-theme', resolved);
      root.style.colorScheme = resolved;
    };

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches ? 'dark' : 'light');
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      apply(theme);
    }
  }, [theme]);

  return { theme, setTheme };
}

export function useMotion() {
  const { motionLevel } = useSettingsStore();
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return motionLevel === 'full' && !prefersReduced
    ? 'full'
    : motionLevel === 'reduced'
    ? 'reduced'
    : 'off';
}
