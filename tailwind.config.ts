import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rebel: {
          red: "#EF4035",
          "nav-bg": "#FFF1F1",
          text: "#0C1433",
          hover: "#FFDADB",
        },
      },
      fontFamily: {
        heading: ["freight-sans-pro", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
