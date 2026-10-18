/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        kavach: {
          bg: '#e3e8dc',
          'dark-0': '#0a2a12',
          'dark-1': '#0d3617',
          lime: '#c8f542',
          'lime-hover': '#b5e332',
          caution: '#f5b942',
          danger: '#ff5a4d',
          'white-90': 'rgba(255, 255, 255, 0.90)',
          'white-60': 'rgba(255, 255, 255, 0.60)',
          'white-28': 'rgba(255, 255, 255, 0.28)',
          'white-18': 'rgba(255, 255, 255, 0.18)',
          'white-10': 'rgba(255, 255, 255, 0.10)',
          'white-5': 'rgba(255, 255, 255, 0.05)',
        },
      },
      borderRadius: {
        '28': '28px',
        '[28px]': '28px',
      },
      scale: {
        '104': '1.04',
      },
      fontFamily: {
        heading: ['var(--font-geist)', 'Geist', 'Noto Sans Devanagari', 'Noto Sans Gujarati', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'Noto Sans Devanagari', 'Noto Sans Gujarati', 'sans-serif'],
      },
      backgroundImage: {
        'frame-gradient': 'linear-gradient(160deg, #0a2a12 0%, #0d3617 45%, #0a2a12 100%)',
        'cta-gradient': 'radial-gradient(circle at center, rgba(200, 245, 66, 0.15) 0%, rgba(13, 54, 23, 0.4) 50%, rgba(10, 42, 18, 0.8) 100%)',
      },
      boxShadow: {
        'lime-glow': '0 0 25px rgba(200, 245, 66, 0.25)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'float-slow': 'float 4s ease-in-out infinite',
        'float-delayed': 'float 5s ease-in-out 1.5s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
};
