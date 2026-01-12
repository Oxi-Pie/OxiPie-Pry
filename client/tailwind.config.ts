import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Importante: Si no tienes carpeta src, las rutas deben ser estas:
    "./app/**/*.{js,ts,jsx,tsx,mdx}", 
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        oxi: {
          blue: "#185A9D", // Azul corporativo
          dark: "#0F3A65", // Azul oscuro textos
          light: "#E3F2FD", // Fondo suave
        },
        pie: {
          green: "#43CB83", // Verde vibrante
          dark: "#2E8B57", // Verde oscuro
        }
      },
    },
  },
  plugins: [],
};
export default config;