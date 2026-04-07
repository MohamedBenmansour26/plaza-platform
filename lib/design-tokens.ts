// lib/design-tokens.ts
// Source of truth: design-exports/part1-desktop/src/styles/theme.css
// Do NOT hardcode these values in components — import from here.

export const colors = {
  primary: '#2563EB',
  primaryForeground: '#ffffff',
  accent: '#E8632A',
  accentForeground: '#ffffff',
  success: '#16A34A',
  successForeground: '#ffffff',
  error: '#DC2626',
  errorForeground: '#ffffff',
  warning: '#D97706',
  dark: '#1C1917',
  mid: '#78716C',
  surface: '#FAFAF9',
  card: '#FFFFFF',
  cardForeground: '#1C1917',
  border: '#E2E8F0',
  muted: '#F5F5F4',
  mutedForeground: '#78716C',
  secondary: '#F8FAFC',
  secondaryForeground: '#1C1917',
  sidebar: '#ffffff',
  sidebarBorder: '#E2E8F0',
  sidebarAccent: '#F8FAFC',
  sidebarPrimary: '#2563EB',
} as const

export const badge = {
  // Order status badges
  pending:    { bg: '#F5F5F4', text: '#78716C' },
  confirmed:  { bg: '#EFF6FF', text: '#2563EB' },
  dispatched: { bg: '#FFF7ED', text: '#E8632A' },
  delivered:  { bg: '#F0FDF4', text: '#16A34A' },
  cancelled:  { bg: '#FEF2F2', text: '#DC2626' },
  // Payment badges
  cod:          { bg: '#F5F5F4', text: '#78716C' },
  card_terminal: { bg: '#EFF6FF', text: '#2563EB' },
  card:         { bg: '#F5F3FF', text: '#7C3AED' },
} as const

export const layout = {
  sidebarWidth: '240px',
  contentMaxWidth: '1040px',
  headerHeight: '64px',
  mobileNavHeight: '64px',
  cardRadius: '12px',
  badgeRadius: '9999px',
  inputRadius: '8px',
  cardShadow: '0 1px 3px rgba(0,0,0,0.08)',
} as const

export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: '16px',
} as const
