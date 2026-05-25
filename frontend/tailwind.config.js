export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 40px rgba(94, 123, 255, 0.25)',
      },
      backgroundImage: {
        'neon-grid': 'radial-gradient(circle at top left, rgba(91, 105, 255, 0.18), transparent 24%), radial-gradient(circle at bottom right, rgba(147, 0, 255, 0.16), transparent 28%)'
      }
    },
  },
  plugins: [],
};
