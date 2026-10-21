/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        // Brand & Action
        primary: '#1e7e34',
        'primary-hover': '#166527',
        'brand-accent': '#30a83c',
        'on-primary': '#ffffff',
        'green-strong': '#166534',
        'green-surface': '#e8f8ec',

        // Surfaces & Hairlines
        canvas: '#f2f4f7',
        surface: '#ffffff',
        hairline: '#e2e5e9',
        'hairline-dark': '#cbd5e1',

        // Ink & Text
        ink: '#111827',
        body: '#374151',
        muted: '#595f69',
        'muted-elder': '#1f2937',

        // The Kavach Risk Scale (Replaces deal temperatures)
        'risk-calm': '#1d4ed8',
        'risk-calm-surface': '#eff6ff',
        'risk-calm-border': '#bfdbfe',
        'risk-caution': '#c2410c',
        'risk-caution-surface': '#fff7ed',
        'risk-caution-border': '#fed7aa',
        'risk-alert': '#b91c1c',
        'risk-alert-surface': '#fef2f2',
        'risk-alert-border': '#fecaca',
        'risk-emergency': '#991b1b',
        'risk-emergency-border': '#7f1d1d',

        // Accents
        premium: '#6d28d9',
        'premium-surface': '#f5f3ff',
        'premium-border': '#ddd6fe',
        'warning-text': '#854d0e',
        'warning-surface': '#fefce8',
        'warning-border': '#fef08a',

        // Backward compatibility aliases
        hot: '#b91c1c',
        cold: '#1d4ed8',
        warm: '#c2410c',
        'discount-surface': '#e8f8ec',
        kavach: {
          bg: '#f2f4f7',
          primary: '#1e7e34',
          card: '#ffffff',
          hairline: '#e2e5e9',
          ink: '#111827',
          body: '#374151',
        },
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '8px', // Card standard
        full: '540px', // Pill standard
        circle: '9999px',
        '28': '8px', // Normalize legacy 28px tokens to 8px card radius
        '[28px]': '8px',
      },
      fontFamily: {
        sans: ["'Mulish'", "'Nunito Sans'", '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'Roboto', 'sans-serif'],
        hindi: ["'Noto Sans Devanagari'", "'Mulish'", 'sans-serif'],
        gujarati: ["'Noto Sans Gujarati'", "'Mulish'", 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        heading: ["'Mulish'", "'Nunito Sans'", 'sans-serif'],
        body: ["'Mulish'", "'Nunito Sans'", 'sans-serif'],
      },
      fontWeight: {
        medium: '500',
        bold: '700',
      },
      fontSize: {
        display: ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading-lg': ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        heading: ['20px', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '700' }],
        lead: ['18px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '500' }],
        body: ['16px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '500' }],
        ui: ['14px', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '700' }],
        caption: ['12px', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '500' }],
        micro: ['10px', { lineHeight: '1.2', letterSpacing: '+0.02em', fontWeight: '700' }],
        mono: ['15px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '500' }],
      },
      boxShadow: {
        'level-0': 'none',
        'level-1': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'level-2': '0 4px 12px rgba(17, 24, 39, 0.08)',
        'level-3': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        card: 'none',
        'glass-card': '0 4px 12px rgba(17, 24, 39, 0.08)',
      },
      transitionDuration: {
        120: '120ms',
        180: '180ms',
        240: '240ms',
      },
      transitionTimingFunction: {
        'ease-out-kavach': 'cubic-bezier(0, 0, 0.2, 1)',
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
    },
  },
};
