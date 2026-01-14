import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- WARNA DARI PROYEK LAMA ---
        "sidebar-bg": "#1A233A",          // Biru Tua Gelap
        "sidebar-text": "#FFFFFF",        // Teks Putih
        "sidebar-active-bg": "#FFFFFF",   // Putih saat menu aktif
        "sidebar-active-text": "#1A233A", // Teks biru saat aktif
        "filter-bar-bg": "#2C3A57",       // Biru Header Filter
        "content-bg": "#F8F9FA",          // Abu-abu background utama
        "button-blue": "#0D6EFD",
        "success-green": "#198754",
        "danger-red": "#DC3545",
      },
    },
  },
  plugins: [],
};
export default config;