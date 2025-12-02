/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      },
      colors: {
        'deep-onyx': '#0B0C12',
        'glass-dark': '#12131B',
        'neon-crimson': '#FF2E63',
        'deep-ruby': '#C81D4E',
        'emerald-glow': '#00D4A1',
        'emerald-dark': '#00A07A',
        'soft-white': '#F5F5F5',
        'secondary-text': '#A0A0A0',
        'toxic-mint': '#00FFB2',
        'error-red': '#FF3B6D',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at center, #0B0C12, #12131B)',
        'accent-gradient-1': 'linear-gradient(135deg, #FF2E63, #C81D4E)',
        'accent-gradient-2': 'linear-gradient(135deg, #00D4A1, #00A07A)',
      },
    },
  },
  plugins: [],
}
