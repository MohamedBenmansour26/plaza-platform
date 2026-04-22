import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ─── shadcn/ui semantic colors ───────────────────────────── */
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        /* ─── Merchant sidebar tokens (design-refresh v1 PR #2) ───── */
        /* Dark-slate sidebar for merchant dashboard. Admin scope     */
        /* overrides these inside `.admin-scope` (separate PR).       */
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
        },

        /* ─── Plaza design tokens ─────────────────────────────────── */
        /* Usage: bg-plaza-primary-600, text-plaza-accent-600, etc.   */
        'plaza-primary': {
          50: 'hsl(var(--plaza-color-primary-50))',
          100: 'hsl(var(--plaza-color-primary-100))',
          200: 'hsl(var(--plaza-color-primary-200))',
          300: 'hsl(var(--plaza-color-primary-300))',
          400: 'hsl(var(--plaza-color-primary-400))',
          500: 'hsl(var(--plaza-color-primary-500))',
          600: 'hsl(var(--plaza-color-primary-600))', /* #2563EB */
          700: 'hsl(var(--plaza-color-primary-700))',
          800: 'hsl(var(--plaza-color-primary-800))',
          900: 'hsl(var(--plaza-color-primary-900))',
        },
        'plaza-accent': {
          50: 'hsl(var(--plaza-color-accent-50))',
          100: 'hsl(var(--plaza-color-accent-100))',
          200: 'hsl(var(--plaza-color-accent-200))',
          300: 'hsl(var(--plaza-color-accent-300))',
          400: 'hsl(var(--plaza-color-accent-400))',
          500: 'hsl(var(--plaza-color-accent-500))',
          600: 'hsl(var(--plaza-color-accent-600))', /* #E8632A */
          700: 'hsl(var(--plaza-color-accent-700))',
          800: 'hsl(var(--plaza-color-accent-800))',
          900: 'hsl(var(--plaza-color-accent-900))',
        },
        'plaza-neutral': {
          50: 'hsl(var(--plaza-color-neutral-50))',
          100: 'hsl(var(--plaza-color-neutral-100))',
          200: 'hsl(var(--plaza-color-neutral-200))',
          300: 'hsl(var(--plaza-color-neutral-300))',
          400: 'hsl(var(--plaza-color-neutral-400))',
          500: 'hsl(var(--plaza-color-neutral-500))',
          600: 'hsl(var(--plaza-color-neutral-600))',
          700: 'hsl(var(--plaza-color-neutral-700))',
          800: 'hsl(var(--plaza-color-neutral-800))',
          900: 'hsl(var(--plaza-color-neutral-900))',
        },
        'plaza-success': {
          500: 'hsl(var(--plaza-color-success-500))',
        },
        'plaza-warning': {
          500: 'hsl(var(--plaza-color-warning-500))',
        },
        'plaza-error': {
          500: 'hsl(var(--plaza-color-error-500))',
        },
        'plaza-surface': {
          1: 'hsl(var(--plaza-color-surface-1))',
          2: 'hsl(var(--plaza-color-surface-2))',
          3: 'hsl(var(--plaza-color-surface-3))',
          4: 'hsl(var(--plaza-color-surface-4))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.06)',
      },

    },
  },
  plugins: [],
};

export default config;
