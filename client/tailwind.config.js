/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // JNTUA institutional identity — preserved from the legacy site.
        navy:    { DEFAULT: '#003087', 700: '#002766', 900: '#001a45' },
        crimson: { DEFAULT: '#c8102e', 700: '#a50d26' },
        gold:    { DEFAULT: '#c9a227' },
        ink:     '#1b1f2a',
        paper:   '#f7f8fa',
        // Semantic tokens (flip in dark mode via CSS variables) — use these for
        // surfaces/text so components are theme-aware without hard-coded colors.
        canvas:  'rgb(var(--canvas) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        content: 'rgb(var(--content) / <alpha-value>)',
        muted:   'rgb(var(--muted) / <alpha-value>)',
        line:    'rgb(var(--line) / <alpha-value>)',
        brand:   'rgb(var(--brand) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Crimson Pro"', 'Georgia', 'serif'],
        sans:    ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(16,24,40,.08), 0 1px 2px rgba(16,24,40,.06)',
        lift: '0 20px 60px rgba(0,0,0,.18)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'none' } },
      },
      animation: { shimmer: 'shimmer 1.5s infinite', 'fade-up': 'fade-up .4s ease-out both' },
      container: { center: true, padding: '1rem', screens: { '2xl': '1200px' } },
    },
  },
  plugins: [],
};
