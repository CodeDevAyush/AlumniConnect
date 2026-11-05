import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: "#f4f4fa",
          100: "#e8e9f5",
          200: "#d8ccff",
          300: "#b8b8d9",
          400: "#777da6",
          500: "#343b70",
          600: "#10143a",
          700: "#0b102f",
          800: "#080c24",
          900: "#050718",
        },
        brand: {
          ink: "#10143a",
          orange: "#ff7a1a",
          mint: "#8fe3c0",
          gold: "#ffe08a",
          lavender: "#d8ccff",
        },
      },
    },
  },
  plugins: [],
};

export default config;
