/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        'pixel': '6px',
        'pixel-sm': '4px',
        'pixel-lg': '8px',
      },
      borderWidth: {
        'pixel': '3px',
        'pixel-thick': '4px',
      },
      boxShadow: {
        '8bit-sm': '3px 3px 0px #ffffff',
        '8bit': '4px 4px 0px #000000, 5px 5px 0px #ffffff',
        '8bit-lg': '8px 8px 0px #ffffff',
        '8bit-hover': '6px 6px 0px #000000, 7px 7px 0px #ffffff',
        '8bit-active': '2px 2px 0px #000000, 3px 3px 0px #ffffff',
        '8bit-input': '3px 3px 0px #ffffff',
        '8bit-input-focus': '0 0 0 2px #ffffff, 0 0 0 4px #000000',
      },
      transitionDuration: {
        '8bit': '100ms',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-8bit': 'pulse-8bit 2s ease-in-out infinite',
        'blink': 'blink 0.6s ease-in-out infinite',
        'scanline': 'scanline 0.3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-8bit': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(4px)' },
        },
      },
    },
  },
  plugins: [],
}
