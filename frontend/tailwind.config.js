/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- ¡Esta línea es la clave!
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}