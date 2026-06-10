/** @type {import('tailwindcss').Config} */
// Static design tokens mirror src/theme/index.ts. The runtime-swappable brand
// "accent" stays in JS (theme accentSet) and is applied via inline style.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0c0e12',
        s1: '#14161c',
        s2: '#1b1e26',
        s3: '#23262f',
        line: 'rgba(255,255,255,0.08)',
        line2: 'rgba(255,255,255,0.14)',
        ink: '#f3f5f8',
        dim: '#a4abb6',
        faint: '#6b7280',
      },
      borderRadius: {
        card: '22px',
        btn: '16px',
        icon: '14px',
        sheet: '30px',
      },
      fontFamily: {
        display: ['SpaceGrotesk_600SemiBold'],
        body: ['Manrope_500Medium'],
        mono: ['SpaceMono_400Regular'],
      },
    },
  },
  plugins: [],
};
