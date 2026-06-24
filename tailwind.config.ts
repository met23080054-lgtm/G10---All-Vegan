import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fdf2f1",
          100: "#fce1df",
          200: "#f8c2be",
          300: "#f28e87",
          400: "#eb493d",
          500: "#941810",
          600: "#6b120b",
          700: "#530e09",
          800: "#410b07",
          900: "#2e0805",
        },
        accent: "#f97316",
      },
      fontFamily: {
        sans: ["Be Vietnam Pro", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
