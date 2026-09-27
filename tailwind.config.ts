import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        obsidian: '#060807',
        forest: {
          950: '#070b08',
          900: '#0c140e',
          800: '#132217',
          500: '#2d5a3c',
          400: '#4a855c',
        },
        gold: {
          200: '#f5e6c8',
          300: '#e5c992',
          400: '#d4af37',
          500: '#b89028',
        },
      },
    },
  },
  plugins: [],
};

export default config;
