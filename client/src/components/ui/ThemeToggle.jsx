import { useTheme } from '../../hooks/useTheme.js';
// Accessible light/dark switch.
export default function ThemeToggle({ className = '' }) {
  const { isDark, toggle } = useTheme();
  return (
    <button onClick={toggle} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={isDark}
      className={`grid h-9 w-9 place-items-center rounded-full text-current transition hover:bg-current/10 ${className}`}>
      <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true" />
    </button>
  );
}
