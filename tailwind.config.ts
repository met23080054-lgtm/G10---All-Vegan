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
          50: "#faf5f5",
          100: "#f3e9e8",
          200: "#e8d0cf",
          300: "#d9a8a3",
          400: "#c17068",
          500: "#941810",
          600: "#6b120b",
          700: "#530e09",
          800: "#410b07",
          900: "#2e0805",
        },
        accent: "#f97316",
      },
      fontFamily: {
        sans: ["Nunito", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
