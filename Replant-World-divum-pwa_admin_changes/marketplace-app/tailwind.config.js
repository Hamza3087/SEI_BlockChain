/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', ...defaultTheme.fontFamily.sans] },
    },
    colors: {
      white: colors.white,
      black: colors.black,
      transparent: colors.transparent,
      teal: {
        900: '#1b3233',
        700: '#2a4546',
        650: '#6E8683',
        600: '#7B9C93',
        300: '#daece6',
        200: '#eaeee8',
        100: '#f4f3f2',
      },
      green: {
        400: '#4C5E41',
        300: '#C5D8D9',
        200: '#DFEAD8',
        100: '#F7FAF4',
      },
      gray: {
        200: '#EFEFEF',
      },
    },
  },
  plugins: [],
};
