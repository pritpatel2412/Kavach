/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    screens: {
      sm: '640px',
      md: '768px', // Desktop boundary per DESIGN.md
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        // Brand & Action
        primary: '#30a83c',
        'on-primary': '#ffffff',
        'green-strong': '#1e7e29',

        // Status Colors (Strictly Functional)
        hot: '#e02828',
        cold: '#1877f2',
        warm: '#f57c00',
        premium: '#7c3aed',
        'discount-surface': '#e6f7ec',
        'warning-surface': '#fef9c3',
        'warning-text': '#854d0e',

        // Surfaces & Hairlines
        canvas: '#f2f4f7',
        surface: '#ffffff',
        hairline: '#e2e5e9',

        // Ink & Text
        ink: '#111111',
        body: '#595f69',
        muted: '#8c939d',

        // Aliases for compatibility
        kavach: {
          bg: '#f2f4f7',
          primary: '#30a83c',
          card: '#ffffff',
          hairline: '#e2e5e9',
          ink: '#111111',
          body: '#595f69',
        },
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        full: '540px',
        circle: '9999px',
        '28': '8px', // Normalize legacy 28px tokens to 8px card radius
        '[28px]': '8px',
      },
      fontFamily: {
        sans: ["'Mulish'", "'Nunito Sans'", '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        heading: ["'Mulish'", "'Nunito Sans'", 'sans-serif'],
        body: ["'Mulish'", "'Nunito Sans'", 'sans-serif'],
      },
      fontWeight: {
        medium: '500',
        bold: '700',
      },
      fontSize: {
        display: ['48px', { lineHeight: '1.1', letterSpacing: '0', fontWeight: '700' }],
        'heading-lg': ['24px', { lineHeight: '1.2', letterSpacing: '0', fontWeight: '700' }],
        heading: ['20px', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '700' }],
        lead: ['18px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '500' }],
        body: ['16px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '500' }],
        ui: ['14px', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '700' }],
        caption: ['12px', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '500' }],
        micro: ['10px', { lineHeight: '1.2', letterSpacing: '0', fontWeight: '700' }],
        mono: ['16px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '500' }],
      },
      boxShadow: {
        'level-0': 'none',
        'level-1': 'none',
        'level-2': '0 4px 12px rgba(11, 22, 44, 0.09)',
        'level-3': '-1px 11px 15px -11px rgba(0, 0, 0, 0.38)',
        card: 'none',
        'glass-card': '0 4px 12px rgba(11, 22, 44, 0.09)',
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
    },
  },
};
