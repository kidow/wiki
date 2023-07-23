/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#dffc03'
      }
    }
  },
  plugins: [require('prettier-plugin-tailwindcss')]
}
