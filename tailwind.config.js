/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // HAPUS backgroundImage yang di-extend karena sudah ada di Tailwind default
      colors: {
        primary: "#1a73e8",
        secondary: "#34a853",
        accent: "#fbbc05",
        dark: "#1e293b",
        light: "#f8fafc",
      },
      fontFamily: {
        sans: ["Poppins"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
