import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      colors: {
        cockpit: {
          ink: "#101114",
          panel: "#17181d",
          panel2: "#202127",
          line: "#32343b",
          text: "#f4f2ed",
          muted: "#a8aaa7",
          teal: "#48d6bd",
          amber: "#f1b24a",
          coral: "#ff7a6f",
          violet: "#a78bfa",
        },
      },
      boxShadow: {
        probe: "0 20px 60px rgba(0, 0, 0, 0.42)",
      },
    },
  },
  plugins: [],
} satisfies Config;
