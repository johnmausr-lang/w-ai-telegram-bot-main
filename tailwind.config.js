/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'eclipse-bg': '#05050A',
        'glass-card': '#11111A',
        'glass-stroke': 'rgba(255,255,255,0.06)',
        'neon-pink': '#FF2FAE',
        'neon-cyan': '#14E3FF',
        'glow-purple': '#9011FF',
        'text-primary': '#F2F2F7',
        'text-secondary': '#8F8FA4',
        'success': '#2AFFC6',
        'error': '#FF4F6A',
      },
      backgroundImage: {
        'neon-blend': 'linear-gradient(135deg, #FF2FAE 0%, #9011FF 50%, #14E3FF 100%)',
        'pink-glow': 'linear-gradient(90deg, #FF2FAE, #CC1C8F)',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
