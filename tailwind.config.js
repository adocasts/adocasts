const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('@radix-ui/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./resources/**/*.{edge,js,ts,vue,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          '0': colors.violet.violet1,
          '50': colors.violet.violet2,
          '100': colors.violet.violet3,
          '200': colors.violet.violet4,
          '300': colors.violet.violet5,
          '400': colors.violet.violet6,
          '500': colors.violet.violet7,
          '600': colors.violet.violet8,
          '700': colors.violet.violet9,
          '800': colors.violet.violet10,
          '900': colors.violet.violet11,
          '950': colors.violet.violet12,
        },
        accent: {
          '0': colors.crimson.crimson1,
          '50': colors.crimson.crimson2,
          '100': colors.crimson.crimson3,
          '200': colors.crimson.crimson4,
          '300': colors.crimson.crimson5,
          '400': colors.crimson.crimson6,
          '500': colors.crimson.crimson7,
          '600': colors.crimson.crimson8,
          '700': colors.crimson.crimson9,
          '800': colors.crimson.crimson10,
          '900': colors.crimson.crimson11,
          '950': colors.crimson.crimson12,
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', ...defaultTheme.fontFamily.sans],
        body: ['var(--font-body)', ...defaultTheme.fontFamily.sans],
        serif: [...defaultTheme.fontFamily.serif],
        sans: ['Poppins', ...defaultTheme.fontFamily.sans],
        mono: ['Dank Mono', ...defaultTheme.fontFamily.mono]
      },
    },
  },
  corePlugins: {
    preflight: true
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp')
  ],
}
