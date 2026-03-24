/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0e1a',
          secondary: '#0f1629',
          card: '#141a2e',
          'card-hover': '#1a2240',
        },
        accent: {
          DEFAULT: '#6366f1',
          glow: 'rgba(99, 102, 241, 0.25)',
        },
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
        },
        border: 'rgba(99, 102, 241, 0.2)',
      },
    },
  },
  plugins: [],
}
