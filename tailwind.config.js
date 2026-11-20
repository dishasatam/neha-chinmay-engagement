/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: '#4A101D',
          deep: '#310912',
          wine: '#641D2B',
          light: '#7A2234',
          dark: '#24060C',
        },
        gold: {
          champagne: '#D7B66F',
          antique: '#B58E4C',
          light: '#F3E5AB',
          DEFAULT: '#D7B66F',
          dark: '#8C6B2D',
        },
        ivory: '#F7EFDF',
        cream: '#F5EBDD',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Tiro Devanagari Marathi"', '"Noto Serif Devanagari"', 'serif'],
        sans: ['"Poppins"', '"Noto Sans Devanagari"', 'sans-serif'],
        marathi: ['"Tiro Devanagari Marathi"', '"Noto Sans Devanagari"', 'sans-serif'],
      },
      boxShadow: {
        'royal': '0 10px 30px -10px rgba(74, 16, 29, 0.4)',
        'gold-glow': '0 0 25px rgba(215, 182, 111, 0.35)',
        'gold-glow-lg': '0 0 45px rgba(215, 182, 111, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gold-gradient': 'linear-gradient(135deg, #D7B66F 0%, #F5EBDD 50%, #B58E4C 100%)',
        'maroon-gradient': 'linear-gradient(135deg, #4A101D 0%, #310912 100%)',
      }
    },
  },
  plugins: [],
}
