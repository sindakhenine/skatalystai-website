/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ========================================
        // BRAND_DNA.md — LOCKED COLORS
        // Do not modify without founder approval
        // ========================================

        // Primary Brand Color — Catalyst Slate
        slate: {
          DEFAULT: '#2F3A44',
          hover: '#3A4550',
          active: '#252E36',
        },

        // Signature Accent — Catalyst Ion
        ion: {
          DEFAULT: '#2FA4A9',
          glow: 'rgba(47, 164, 169, 0.12)',
          ring: 'rgba(47, 164, 169, 0.4)',
        },

        // Semantic Colors — LOCKED
        success: {
          DEFAULT: '#4E7C6F', // Sage Verified
          bg: 'rgba(78, 124, 111, 0.1)',
        },
        warning: {
          DEFAULT: '#C58B3A', // Amber Clay
          bg: 'rgba(197, 139, 58, 0.1)',
        },
        error: {
          DEFAULT: '#8C3A3A', // Oxide Red
          bg: 'rgba(140, 58, 58, 0.1)',
        },
        info: {
          DEFAULT: '#6FAFB3', // Soft Cyan
          bg: 'rgba(111, 175, 179, 0.1)',
        },

        // Light Mode Neutrals
        light: {
          bg: '#F6F7F8',
          surface: '#FFFFFF',
          soft: '#EEF1F3',
          border: '#D7DEE3',
          divider: '#E5EAEE',
        },

        // Dark Mode Neutrals
        dark: {
          bg: '#0F1720',
          surface: '#161E27',
          soft: '#1E2933',
          border: '#2A3440',
          divider: '#23303C',
        },

        // Text Colors
        text: {
          primary: '#1F2933',
          secondary: '#5F6B76',
          inverse: '#FFFFFF',
          // Dark mode text
          'dark-primary': '#E6EBEF',
          'dark-secondary': '#9AA6B2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'SF Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display': ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        'h1': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h2': ['20px', { lineHeight: '1.35', fontWeight: '600' }],
        'h3': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-lg': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
        'mono': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        '18': '72px',
        '22': '88px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 12px rgba(0,0,0,0.08)',
        'lg': '0 8px 24px rgba(0,0,0,0.12)',
        'button': '0 4px 12px rgba(0,0,0,0.08)',
        'button-hover': '0 6px 16px rgba(0,0,0,0.12)',
        'ion-glow': '0 0 0 3px rgba(47, 164, 169, 0.12)',
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'button': '10px',
        'xl': '12px',
        '2xl': '16px',
      },
      transitionDuration: {
        'fast': '100ms',
        'normal': '200ms',
        'slow': '300ms',
      },
      width: {
        'sidebar': '250px',
        'sidebar-collapsed': '64px',
      },
      height: {
        'header': '64px',
      },
      maxWidth: {
        'content': '1200px',
      },
      ringColor: {
        'ion': '#2FA4A9',
      },
      ringOffsetColor: {
        'ion': 'rgba(47, 164, 169, 0.12)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(4px)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(47, 164, 169, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(47, 164, 169, 0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
