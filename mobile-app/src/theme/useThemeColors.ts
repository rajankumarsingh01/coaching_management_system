// src/theme/useThemeColors.ts
//
// Falls back to the same default blue used in BrandingContext when no
// institute branding has loaded yet, so screens never flash unstyled.

import { useMemo } from 'react';
import { useBranding } from '../context/BrandingContext';
import { neutral, semantic } from './tokens';

const FALLBACK_PRIMARY = '#2563EB';
const FALLBACK_SECONDARY = '#1E40AF';

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(
    clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean,
    16
  );
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

// Mixes a hex color toward white by `amount` (0-1) — used to derive a soft
// tinted background (e.g. selected tab pill, badge fill) from whatever
// primary color an institute picks, without needing a designer to supply one.
function tint(hex: string, amount: number) {
  try {
    const { r, g, b } = hexToRgb(hex);
    const mix = (c: number) => Math.round(c + (255 - c) * amount);
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  } catch {
    return neutral[100];
  }
}

// Relative luminance → decide if white or dark text sits on top of the
// brand color legibly. Institutes can pick light accent colors too, so
// this can't be hardcoded to "always white text".
function isDark(hex: string) {
  try {
    const { r, g, b } = hexToRgb(hex);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum < 0.6;
  } catch {
    return true;
  }
}

export function useThemeColors() {
  const { branding } = useBranding();
  const primary = branding?.primaryColor || FALLBACK_PRIMARY;
  const secondary = branding?.secondaryColor || FALLBACK_SECONDARY;

  return useMemo(
    () => ({
      // Brand
      primary,
      primaryMuted: tint(primary, 0.88),
      onPrimary: isDark(primary) ? '#FFFFFF' : neutral[900],
      secondary,

      // Surfaces
      background: neutral[0],
      surface: neutral[50],
      border: neutral[200],
      borderStrong: neutral[300],

      // Text
      text: neutral[900],
      textMuted: neutral[500],
      textFaint: neutral[400],

      // Semantic
      success: semantic.success,
      successBg: semantic.successBg,
      danger: semantic.danger,
      dangerBg: semantic.dangerBg,
      warning: semantic.warning,
      warningBg: semantic.warningBg,
      info: semantic.info,
      infoBg: semantic.infoBg,
    }),
    [primary, secondary]
  );
}