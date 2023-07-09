/* eslint-disable no-undef */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      keyframes: {
        'slide-in-top': {
          '0%': {
            transform: `translateY(-1000px)`,
            opacity: 0,
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: 1,
          },
        },
      },
      animation: {
        'slide-in-top': 'slide-in-top 1s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.25s both',
      },
      colors: {
        primary: { light: '#c0fdfb', main: '#00fff5', dark: '#0091ad' },
        secondary: { light: '#ffffff', main: '#b6b6bb', dark: '#85858e' },
        background: { light: '#005377', main: '#121222', dark: '#020414' },
      },
      spacing: {
        '16/9': '56.25%', // 16:9
      },
    },
  },
  variants: {
    extend: {},
  },
}
