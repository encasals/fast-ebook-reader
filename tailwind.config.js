/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Newspaper-style light theme colors (matching icon: white, black, red)
        paper: {
          bg: '#faf8f5',        // Warm off-white (newspaper paper)
          surface: '#f5f2ed',    // Slightly darker cream
          accent: '#ebe6dd',     // Warm gray accent
          border: '#d4cfc4',     // Warm border color
        },
        ink: {
          dark: '#1a1a1a',       // Rich black text (like newspaper ink)
          medium: '#4a4a4a',     // Medium gray
          light: '#7a7a7a',      // Light gray
          muted: '#a0a0a0',      // Muted text
        },
        // Night mode colors (comfortable for reading at night)
        night: {
          bg: '#1c1917',         // Warm dark (stone-900)
          surface: '#292524',    // Warm dark surface (stone-800)
          accent: '#44403c',     // Warm accent (stone-700)
          border: '#57534e',     // Warm border (stone-600)
        },
        // Legacy dark colors (for backwards compatibility during transition)
        dark: {
          bg: '#1c1917',
          surface: '#292524',
          accent: '#44403c',
        },
        // Primary red accent (from icon: #b91c1c)
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',        // Main brand red (from icon)
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Pivot color - the red from the icon
        pivot: '#b91c1c',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
