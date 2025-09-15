export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] },
      boxShadow: {
        'soft': '0 10px 30px -10px rgba(2,6,23,0.45)'
      },
      maxWidth: {
        '4xl': '70rem'
      }
    }
  },
  plugins: []
}