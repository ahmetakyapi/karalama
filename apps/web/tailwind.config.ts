import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#04070d',
          secondary: '#0a1021',
          surface: 'rgba(255,255,255,0.03)',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.08)',
          'border-hover': 'rgba(255,255,255,0.15)',
        },
        accent: {
          indigo: '#6366f1',
          cyan: '#22d3ee',
          emerald: '#10b981',
        },
      },
      backdropBlur: {
        glass: '16px',
      },
      transitionTimingFunction: {
        custom: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.22,1,0.36,1)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.22,1,0.36,1)',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
