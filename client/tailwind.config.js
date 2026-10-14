/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eafcfe",
          100: "#cff7fb",
          500: "#12a7b8",
          600: "#078fa1",
          700: "#087487",
          900: "#073c4a",
        },
      },
      fontFamily: {
        sans: ["Manrope", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        clinical: "0 20px 50px -24px rgba(8, 43, 58, 0.28)",
      },
    },
  },
  plugins: [],
}
