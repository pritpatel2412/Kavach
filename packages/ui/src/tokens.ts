/**
 * Kavach CoinCompass Design System Tokens (The Theme is Law)
 */

export const THEME_TOKENS = {
  colors: {
    bodyBg: '#e3e8dc',
    mainDark0: '#0a2a12',
    mainDark1: '#0d3617',
    mainGradient: 'linear-gradient(160deg, #0a2a12 0%, #0d3617 45%, #0a2a12 100%)',
    accentLime: '#c8f542',
    accentLimeHover: '#b5e332',
    cautionAmber: '#f5b942',
    dangerRed: '#ff5a4d',
    textPrimary: 'rgba(255, 255, 255, 0.90)',
    textSecondary: 'rgba(255, 255, 255, 0.60)',
    textMuted: 'rgba(255, 255, 255, 0.28)',
    borderSubtle: 'rgba(255, 255, 255, 0.10)',
    borderMedium: 'rgba(255, 255, 255, 0.18)',
    borderHighlight: 'rgba(200, 245, 66, 0.30)',
    cardBg: 'rgba(255, 255, 255, 0.05)',
  },
  geometry: {
    frameRadius: '28px',
    pagePadding: 'p-3 sm:p-6 lg:p-10',
    hoverScale: 1.04,
    cardTiltMaxDeg: 6,
    cardTranslateHoverY: '-1.5',
  },
  patterns: {
    hatchOverlay: 'repeating-linear-gradient(115deg, rgba(255,255,255,.035) 0 1px, transparent 1px 9px)',
  },
  fonts: {
    headings: 'Geist, Noto Sans Devanagari, Noto Sans Gujarati, sans-serif',
    body: 'Inter, Noto Sans Devanagari, Noto Sans Gujarati, sans-serif',
  },
} as const;

export type ThemeTokens = typeof THEME_TOKENS;
