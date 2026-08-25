import { useEffect, useState, useCallback } from 'react';

const KEY = 'jntua-theme';
function initial() {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(KEY);
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
export function useTheme() {
  const [theme, setTheme] = useState(initial);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(KEY, theme);
  }, [theme]);
  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return { theme, setTheme, toggle, isDark: theme === 'dark' };
}
