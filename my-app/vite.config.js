import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build",
  },
  server: {
    host: "0.0.0.0",
    port: process.env.PORT || 5173,
    allowedHosts: [
      "digi-uckg.onrender.com", // Adiciona o domínio do Render
      "localhost", // Permite o localhost para testes locais
    ],
  },
});
