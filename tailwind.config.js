import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          cream: '#FBF6EA',
          lineBlue: '#CFE8FF',
          marginPink: '#F8A5C2',
          bgPink: '#FFE4EE',
          btnPink: '#D6336C',
          btnPinkHover: '#C2255C',
          textPink: '#A61E4D',
          focusBlue: '#2F6FA8',
          accentBlue: '#8EC5FC',
          textDarkBlue: '#1F4E79',
          textDark: '#3B2A35',
          textMuted: '#6B5560',
          inputBorder: '#9C6B84',
          page: '#FFF6F9',
          sidebar: '#FBD9E6',
          border: '#F3D9E3',
          text: '#3B2A35',
          subtext: '#6B5560',
          pinkAccent: '#F8A5C2',
          pinkChip: '#FFE0EB',
          pinkTrack: '#FFE4EE',
          raspberry: '#D6336C',
          blueChip: '#DCEBFA',
          blueSoft: '#E9F3FF',
          blueBtn: '#CFE8FF',
          blueAction: '#2F6FA8',
          blueText: '#1F4E79',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(59, 42, 53, 0.06)',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        nunito: ['"Nunito"', 'sans-serif'],
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

