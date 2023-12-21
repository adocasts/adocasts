/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/**/*.{edge,js,ts,jsx,tsx,vue}",
    "./resources/**/*.{edge,js,ts,jsx,tsx,vue}",
    "./resources/views/pages/*.edge",
    "./app/view_models/**/*.ts"
  ],
  theme: {
    extend: {
      colors: {
        white: 'rgb(var(--white) / <alpha-value>)',
        black: 'rgb(var(--black) / <alpha-value>)',

        ['slate-base']: {
          50: 'rgb(var(--slate-base-50) / <alpha-value>)',
          100: 'rgb(var(--slate-base-100) / <alpha-value>)',
          200: 'rgb(var(--slate-base-200) / <alpha-value>)',
          300: 'rgb(var(--slate-base-300) / <alpha-value>)',
          400: 'rgb(var(--slate-base-400) / <alpha-value>)',
          500: 'rgb(var(--slate-base-500) / <alpha-value>)',
          600: 'rgb(var(--slate-base-600) / <alpha-value>)',
          700: 'rgb(var(--slate-base-700) / <alpha-value>)',
          800: 'rgb(var(--slate-base-800) / <alpha-value>)',
          900: 'rgb(var(--slate-base-900) / <alpha-value>)',
          950: 'rgb(var(--slate-base-950) / <alpha-value>)',
        },

        ['brand-base']: {
          50: 'rgb(var(--brand-base-50) / <alpha-value>)',
          100: 'rgb(var(--brand-base-100) / <alpha-value>)',
          200: 'rgb(var(--brand-base-200) / <alpha-value>)',
          300: 'rgb(var(--brand-base-300) / <alpha-value>)',
          400: 'rgb(var(--brand-base-400) / <alpha-value>)',
          500: 'rgb(var(--brand-base-500) / <alpha-value>)',
          600: 'rgb(var(--brand-base-600) / <alpha-value>)',
          700: 'rgb(var(--brand-base-700) / <alpha-value>)',
          800: 'rgb(var(--brand-base-800) / <alpha-value>)',
          900: 'rgb(var(--brand-base-900) / <alpha-value>)',
          950: 'rgb(var(--brand-base-950) / <alpha-value>)',
        },

        ['accent-base']: {
          50: 'rgb(var(--accent-base-50) / <alpha-value>)',
          100: 'rgb(var(--accent-base-100) / <alpha-value>)',
          200: 'rgb(var(--accent-base-200) / <alpha-value>)',
          300: 'rgb(var(--accent-base-300) / <alpha-value>)',
          400: 'rgb(var(--accent-base-400) / <alpha-value>)',
          500: 'rgb(var(--accent-base-500) / <alpha-value>)',
          600: 'rgb(var(--accent-base-600) / <alpha-value>)',
          700: 'rgb(var(--accent-base-700) / <alpha-value>)',
          800: 'rgb(var(--accent-base-800) / <alpha-value>)',
          900: 'rgb(var(--accent-base-900) / <alpha-value>)',
          950: 'rgb(var(--accent-base-950) / <alpha-value>)',
        },

        ['green-base']: {
          50: 'rgb(var(--green-base-50) / <alpha-value>)',
          100: 'rgb(var(--green-base-100) / <alpha-value>)',
          200: 'rgb(var(--green-base-200) / <alpha-value>)',
          300: 'rgb(var(--green-base-300) / <alpha-value>)',
          400: 'rgb(var(--green-base-400) / <alpha-value>)',
          500: 'rgb(var(--green-base-500) / <alpha-value>)',
          600: 'rgb(var(--green-base-600) / <alpha-value>)',
          700: 'rgb(var(--green-base-700) / <alpha-value>)',
          800: 'rgb(var(--green-base-800) / <alpha-value>)',
          900: 'rgb(var(--green-base-900) / <alpha-value>)',
        },

        ['red-base']: {
          50: 'rgb(var(--red-base-50) / <alpha-value>)',
          100: 'rgb(var(--red-base-100) / <alpha-value>)',
          200: 'rgb(var(--red-base-200) / <alpha-value>)',
          300: 'rgb(var(--red-base-300) / <alpha-value>)',
          400: 'rgb(var(--red-base-400) / <alpha-value>)',
          500: 'rgb(var(--red-base-500) / <alpha-value>)',
          600: 'rgb(var(--red-base-600) / <alpha-value>)',
          700: 'rgb(var(--red-base-700) / <alpha-value>)',
          800: 'rgb(var(--red-base-800) / <alpha-value>)',
          900: 'rgb(var(--red-base-900) / <alpha-value>)',
        },

        ['blue-base']: {
          50: 'rgb(var(--blue-base-50) / <alpha-value>)',
          100: 'rgb(var(--blue-base-100) / <alpha-value>)',
          200: 'rgb(var(--blue-base-200) / <alpha-value>)',
          300: 'rgb(var(--blue-base-300) / <alpha-value>)',
          400: 'rgb(var(--blue-base-400) / <alpha-value>)',
          500: 'rgb(var(--blue-base-500) / <alpha-value>)',
          600: 'rgb(var(--blue-base-600) / <alpha-value>)',
          700: 'rgb(var(--blue-base-700) / <alpha-value>)',
          800: 'rgb(var(--blue-base-800) / <alpha-value>)',
          900: 'rgb(var(--blue-base-900) / <alpha-value>)',
        },

        ['orange-base']: {
          50: 'rgb(var(--orange-base-50) / <alpha-value>)',
          100: 'rgb(var(--orange-base-100) / <alpha-value>)',
          200: 'rgb(var(--orange-base-200) / <alpha-value>)',
          300: 'rgb(var(--orange-base-300) / <alpha-value>)',
          400: 'rgb(var(--orange-base-400) / <alpha-value>)',
          500: 'rgb(var(--orange-base-500) / <alpha-value>)',
          600: 'rgb(var(--orange-base-600) / <alpha-value>)',
          700: 'rgb(var(--orange-base-700) / <alpha-value>)',
          800: 'rgb(var(--orange-base-800) / <alpha-value>)',
          900: 'rgb(var(--orange-base-900) / <alpha-value>)',
        },

        slate: {
          50: 'rgb(var(--slate-50) / <alpha-value>)',
          100: 'rgb(var(--slate-100) / <alpha-value>)',
          200: 'rgb(var(--slate-200) / <alpha-value>)',
          300: 'rgb(var(--slate-300) / <alpha-value>)',
          400: 'rgb(var(--slate-400) / <alpha-value>)',
          500: 'rgb(var(--slate-500) / <alpha-value>)',
          600: 'rgb(var(--slate-600) / <alpha-value>)',
          700: 'rgb(var(--slate-700) / <alpha-value>)',
          800: 'rgb(var(--slate-800) / <alpha-value>)',
          900: 'rgb(var(--slate-900) / <alpha-value>)',
          950: 'rgb(var(--slate-950) / <alpha-value>)',
        },

        brand: {
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          300: 'rgb(var(--brand-300) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
          950: 'rgb(var(--brand-950) / <alpha-value>)',
        },

        accent: {
          50: 'rgb(var(--accent-50) / <alpha-value>)',
          100: 'rgb(var(--accent-100) / <alpha-value>)',
          200: 'rgb(var(--accent-200) / <alpha-value>)',
          300: 'rgb(var(--accent-300) / <alpha-value>)',
          400: 'rgb(var(--accent-400) / <alpha-value>)',
          500: 'rgb(var(--accent-500) / <alpha-value>)',
          600: 'rgb(var(--accent-600) / <alpha-value>)',
          700: 'rgb(var(--accent-700) / <alpha-value>)',
          800: 'rgb(var(--accent-800) / <alpha-value>)',
          900: 'rgb(var(--accent-900) / <alpha-value>)',
          950: 'rgb(var(--accent-950) / <alpha-value>)',
        },

        green: {
          50: 'rgb(var(--green-50) / <alpha-value>)',
          100: 'rgb(var(--green-100) / <alpha-value>)',
          200: 'rgb(var(--green-200) / <alpha-value>)',
          300: 'rgb(var(--green-300) / <alpha-value>)',
          400: 'rgb(var(--green-400) / <alpha-value>)',
          500: 'rgb(var(--green-500) / <alpha-value>)',
          600: 'rgb(var(--green-600) / <alpha-value>)',
          700: 'rgb(var(--green-700) / <alpha-value>)',
          800: 'rgb(var(--green-800) / <alpha-value>)',
          900: 'rgb(var(--green-900) / <alpha-value>)',
        },

        red: {
          50: 'rgb(var(--red-50) / <alpha-value>)',
          100: 'rgb(var(--red-100) / <alpha-value>)',
          200: 'rgb(var(--red-200) / <alpha-value>)',
          300: 'rgb(var(--red-300) / <alpha-value>)',
          400: 'rgb(var(--red-400) / <alpha-value>)',
          500: 'rgb(var(--red-500) / <alpha-value>)',
          600: 'rgb(var(--red-600) / <alpha-value>)',
          700: 'rgb(var(--red-700) / <alpha-value>)',
          800: 'rgb(var(--red-800) / <alpha-value>)',
          900: 'rgb(var(--red-900) / <alpha-value>)',
        },

        blue: {
          50: 'rgb(var(--blue-50) / <alpha-value>)',
          100: 'rgb(var(--blue-100) / <alpha-value>)',
          200: 'rgb(var(--blue-200) / <alpha-value>)',
          300: 'rgb(var(--blue-300) / <alpha-value>)',
          400: 'rgb(var(--blue-400) / <alpha-value>)',
          500: 'rgb(var(--blue-500) / <alpha-value>)',
          600: 'rgb(var(--blue-600) / <alpha-value>)',
          700: 'rgb(var(--blue-700) / <alpha-value>)',
          800: 'rgb(var(--blue-800) / <alpha-value>)',
          900: 'rgb(var(--blue-900) / <alpha-value>)',
        },

        orange: {
          50: 'rgb(var(--orange-50) / <alpha-value>)',
          100: 'rgb(var(--orange-100) / <alpha-value>)',
          200: 'rgb(var(--orange-200) / <alpha-value>)',
          300: 'rgb(var(--orange-300) / <alpha-value>)',
          400: 'rgb(var(--orange-400) / <alpha-value>)',
          500: 'rgb(var(--orange-500) / <alpha-value>)',
          600: 'rgb(var(--orange-600) / <alpha-value>)',
          700: 'rgb(var(--orange-700) / <alpha-value>)',
          800: 'rgb(var(--orange-800) / <alpha-value>)',
          900: 'rgb(var(--orange-900) / <alpha-value>)',
        },

        body: 'rgb(var(--body-bg) / <alpha-value>)',
      },

      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
      },

      backgroundSize: {
        'icon-fit': '140%',
        'icon-fit-zoomed': '160%'
      },

      boxShadow: {
        glow: [
          "0 0px 20px rgba(255,255, 255, 0.35)",
          "0 0px 65px rgba(255, 255,255, 0.2)"
        ]
      },

      dropShadow: {
        glow: [
          "0 0px 20px rgba(255,255, 255, 0.35)",
          "0 0px 65px rgba(255, 255,255, 0.2)"
        ]
      },

      fontSize: {
        '2xs': '0.65rem'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // require('@tailwindcss/aspect-ratio'),
  ],
}

