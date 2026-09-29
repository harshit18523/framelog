export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#09090B',
        surface: {
          DEFAULT: '#131316',
          raised: '#18181B',
          high: '#212125',
        },
        fg: {
          DEFAULT: '#FAFAFA',
          muted: '#A1A1AA',
          subtle: '#7C7C86',
          faint: '#56565F',
        },
        gold: {
          DEFAULT: '#F5A623',
          soft: '#F8BA55',
          deep: '#C98512',
          ink: '#1A1206',
        },
        line: {
          DEFAULT: 'rgb(255 255 255 / 0.07)',
          strong: 'rgb(255 255 255 / 0.13)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        display: '-0.04em',
        title: '-0.025em',
      },
      boxShadow: {
        poster: '0 18px 36px -18px rgb(0 0 0 / 0.9), 0 2px 6px -2px rgb(0 0 0 / 0.6)',
        'poster-hover':
          '0 30px 50px -22px rgb(0 0 0 / 0.95), 0 20px 60px -28px rgb(245 166 35 / 0.38)',
        elevated: '0 30px 80px -30px rgb(0 0 0 / 0.9), 0 8px 24px -12px rgb(0 0 0 / 0.6)',
      },
      transitionTimingFunction: {
        cinema: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
  plugins: [],
};
