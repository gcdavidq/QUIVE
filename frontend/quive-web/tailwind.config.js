module.exports = {
  // El tema lo fija ThemeContext con data-theme en <html>; sin esto, las variantes
  // dark: seguían al sistema operativo y no al selector de tema de la app.
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
