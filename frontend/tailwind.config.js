/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: "var(--gov-navy)",
          blue: "var(--gov-blue)",
          "blue-light": "var(--gov-blue-light)",
          saffron: "var(--gov-saffron)",
          green: "var(--gov-green)",
          white: "var(--gov-white)",
          offwhite: "var(--gov-offwhite)",
          red: "var(--gov-red)",
          amber: "var(--gov-amber)",
          text: "var(--gov-text)",
          "text-secondary": "var(--gov-text-secondary)",
          border: "var(--gov-border)",
        },
        bis: {
          navy: "#0C2340",
          blue: "#1A56DB",
          amber: "#D97706",
          emerald: "#138808",
          slate: "#1F2937",
          card: "#FFFFFF",
          border: "#D1D5DB",
        },
        apple: {
          blue: "#1A56DB",
          mint: "#10B981",
          amber: "#D97706",
          red: "#DC2626",
          indigo: "#4F46E5",
        },
      },
    },
  },
  plugins: [],
}
