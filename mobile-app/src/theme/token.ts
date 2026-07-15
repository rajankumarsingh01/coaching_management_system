// src/theme/tokens.ts
//
// Static design tokens — the neutral/semantic foundation shared by every
// role's UI. This is deliberately institute-agnostic: the only thing that
// changes per-institute is the accent color pulled from BrandingContext
// (see useThemeColors.ts). Everything here — grays, spacing, radius,
// type scale, shadows — stays identical across admin/teacher/student/
// parent/superadmin so the app *feels* like one product no matter which
// role is logged in.

export const neutral = {
  0: '#FFFFFF',
  50: '#F8FAFC',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#0F172A',
};

export const semantic = {
  success: '#16A34A',
  successBg: '#F0FDF4',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  warning: '#CA8A04',
  warningBg: '#FEF3C7',
  info: '#7C3AED',
  infoBg: '#F5F3FF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

// Type scale. RN's System font is used throughout (no extra font deps —
// keeps bundle/asset weight low, matters on the i3/8GB dev setup) but
// weight + size + letterSpacing carry the hierarchy so it doesn't read
// as "default app font".
export const typography = {
  display: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.4 },
  h1: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.2 },
  h2: { fontSize: 17, fontWeight: '700' as const, letterSpacing: -0.1 },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, fontWeight: '600' as const },
  label: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.2 },
  caption: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.1 },
  stat: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.6 },
};

// Shared elevation presets — kept subtle (this is a utility SaaS app for
// coaching institutes, not a consumer social app; loud shadows read as
// template-y). Use `card` for most surfaces, `raised` for modals/sheets.
export const shadow = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  raised: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};