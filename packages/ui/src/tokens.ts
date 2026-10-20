/**
 * DESIGN.md Design System Tokens (Single Source of Truth)
 * Deals Community High-Density Architecture
 */

export const DESIGN_TOKENS = {
  colors: {
    // Brand & Action
    primary: '#30a83c',
    onPrimary: '#ffffff',
    greenStrong: '#1e7e29',

    // Status Spectrum (Strictly Functional)
    hot: '#e02828',
    cold: '#1877f2',
    warm: '#f57c00',
    premium: '#7c3aed',
    discountSurface: '#e6f7ec',
    warningSurface: '#fef9c3',
    warningText: '#854d0e',

    // Surfaces & Lines
    canvas: '#f2f4f7',
    surface: '#ffffff',
    hairline: '#e2e5e9',

    // Typography Ink
    ink: '#111111',
    body: '#595f69',
    muted: '#8c939d',
  },

  typography: {
    fonts: {
      sans: "'Mulish', 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
    weights: {
      medium: 500,
      bold: 700,
    },
    scale: {
      display: { size: '48px', weight: 700, lineHeight: '1.1', letterSpacing: '0' },
      headingLg: { size: '24px', weight: 700, lineHeight: '1.2', letterSpacing: '0' },
      heading: { size: '20px', weight: 700, lineHeight: '1.25', letterSpacing: '0' },
      lead: { size: '18px', weight: 500, lineHeight: '1.4', letterSpacing: '0' },
      body: { size: '16px', weight: 500, lineHeight: '1.5', letterSpacing: '0' },
      ui: { size: '14px', weight: 700, lineHeight: '1.3', letterSpacing: '0' },
      caption: { size: '12px', weight: 500, lineHeight: '1.3', letterSpacing: '0' },
      micro: { size: '10px', weight: 700, lineHeight: '1.2', letterSpacing: '0' },
      mono: { size: '16px', weight: 500, lineHeight: '1.4', letterSpacing: '0' },
    },
  },

  spacing: {
    xxs: '2px',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '40px',
  },

  radius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    full: '540px',
    circle: '9999px',
  },

  elevation: {
    level0: 'none',
    level1: '1px solid #e2e5e9',
    level2: '0 4px 12px rgba(11, 22, 44, 0.09)',
    level3: '-1px 11px 15px -11px rgba(0, 0, 0, 0.38)',
  },

  breakpoints: {
    mobileMax: '767px',
    desktopMin: '768px',
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
export const THEME_TOKENS = DESIGN_TOKENS; // Backward compatibility alias
