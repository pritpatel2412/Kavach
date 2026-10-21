/**
 * Kavach Design System Tokens (Single Source of Truth)
 * Aligned strictly with DESIGN.md
 */

export const DESIGN_TOKENS = {
  colors: {
    // Brand & Action
    primary: '#1e7e34', // WCAG AA 4.76:1 with white
    primaryHover: '#166527',
    brandAccent: '#30a83c', // Shield logo mark & light accents
    onPrimary: '#ffffff',
    greenStrong: '#166534', // WCAG AAA 7.41:1 on white
    greenSurface: '#e8f8ec',

    // Surfaces & Hairlines
    canvas: '#f2f4f7', // Cool-gray page ground
    surface: '#ffffff', // Pure white cards & dialogs
    hairline: '#e2e5e9', // 1px borders
    hairlineDark: '#cbd5e1', // Interactive borders

    // Typography Ink
    ink: '#111827', // Headings & primary titles (17.5:1 AAA)
    body: '#374151', // Secondary copy & table rows (10.3:1 AAA)
    muted: '#595f69', // Secondary captions & hints (6.1:1 AA)
    mutedElder: '#1f2937', // Elder screen secondary copy (14.2:1 AAA)

    // The Kavach Risk Scale (Replaces deal temperatures)
    risk: {
      calm: {
        text: '#1d4ed8', // Blue 700 (6.5:1 AA)
        textElder: '#1e40af', // Blue 800 (8.5:1 AAA)
        surface: '#eff6ff',
        border: '#bfdbfe',
      },
      caution: {
        text: '#c2410c', // Orange 700 (5.2:1 AA)
        textElder: '#9a3412', // Orange 800 (7.3:1 AAA)
        surface: '#fff7ed',
        border: '#fed7aa',
      },
      alert: {
        text: '#b91c1c', // Red 700 (6.8:1 AA)
        textElder: '#991b1b', // Red 800 (8.5:1 AAA)
        surface: '#fef2f2',
        border: '#fecaca',
      },
      emergency: {
        text: '#ffffff', // 8.5:1 AAA on #991b1b
        surface: '#991b1b', // Solid Red 800
        border: '#7f1d1d',
      },
    },

    // Accents
    premium: {
      text: '#6d28d9', // Violet 700 (6.6:1 AA)
      textElder: '#5b21b6', // Violet 800 (8.4:1 AAA)
      surface: '#f5f3ff',
      border: '#ddd6fe',
    },
    warning: {
      text: '#854d0e', // Amber 800 (7.2:1 AAA)
      surface: '#fefce8',
      border: '#fef08a',
    },

    // Backward compatibility aliases
    hot: '#b91c1c',
    cold: '#1d4ed8',
    warm: '#c2410c',
    discountSurface: '#e8f8ec',
    warningSurface: '#fefce8',
    warningText: '#854d0e',
  },

  typography: {
    fonts: {
      sans: "'Mulish', 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      hindi: "'Noto Sans Devanagari', 'Mulish', sans-serif",
      gujarati: "'Noto Sans Gujarati', 'Mulish', sans-serif",
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
    weights: {
      medium: 500,
      bold: 700,
    },
    scale: {
      display: { size: '48px', weight: 700, lineHeight: '1.1', letterSpacing: '-0.02em' },
      headingLg: { size: '24px', weight: 700, lineHeight: '1.2', letterSpacing: '-0.01em' },
      heading: { size: '20px', weight: 700, lineHeight: '1.25', letterSpacing: '0' },
      lead: { size: '18px', weight: 500, lineHeight: '1.4', letterSpacing: '0' },
      body: { size: '16px', weight: 500, lineHeight: '1.5', letterSpacing: '0' },
      ui: { size: '14px', weight: 700, lineHeight: '1.3', letterSpacing: '0' },
      caption: { size: '12px', weight: 500, lineHeight: '1.3', letterSpacing: '0' },
      micro: { size: '10px', weight: 700, lineHeight: '1.2', letterSpacing: '+0.02em' },
      mono: { size: '15px', weight: 500, lineHeight: '1.4', letterSpacing: '0' },
    },
  },

  spacing: {
    xxs: '2px',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
    '3xl': '48px',
    '4xl': '64px',
  },

  radius: {
    xs: '2px',
    sm: '4px',
    md: '8px', // Card standard
    full: '540px', // Pill standard
    circle: '9999px',
  },

  elevation: {
    level0: 'none',
    level1: '0 1px 3px rgba(0, 0, 0, 0.05)',
    level2: '0 4px 12px rgba(17, 24, 39, 0.08)',
    level3: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },

  motion: {
    duration: {
      micro: '120ms',
      standard: '180ms',
      modal: '240ms',
    },
    easing: {
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },

  breakpoints: {
    mobileMax: '767px',
    tabletMin: '768px',
    tabletMax: '1023px',
    desktopMin: '1024px',
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
export const THEME_TOKENS = DESIGN_TOKENS;

/**
 * Returns CSS variable definitions to inject into :root
 */
export function getCssVariables(): string {
  return `
    :root {
      --color-primary: ${DESIGN_TOKENS.colors.primary};
      --color-primary-hover: ${DESIGN_TOKENS.colors.primaryHover};
      --color-brand-accent: ${DESIGN_TOKENS.colors.brandAccent};
      --color-canvas: ${DESIGN_TOKENS.colors.canvas};
      --color-surface: ${DESIGN_TOKENS.colors.surface};
      --color-hairline: ${DESIGN_TOKENS.colors.hairline};
      --color-hairline-dark: ${DESIGN_TOKENS.colors.hairlineDark};
      --color-ink: ${DESIGN_TOKENS.colors.ink};
      --color-body: ${DESIGN_TOKENS.colors.body};
      --color-muted: ${DESIGN_TOKENS.colors.muted};
      --radius-card: ${DESIGN_TOKENS.radius.md};
      --radius-pill: ${DESIGN_TOKENS.radius.full};
      --motion-micro: ${DESIGN_TOKENS.motion.duration.micro};
      --motion-standard: ${DESIGN_TOKENS.motion.duration.standard};
      --motion-modal: ${DESIGN_TOKENS.motion.duration.modal};
    }
  `;
}
