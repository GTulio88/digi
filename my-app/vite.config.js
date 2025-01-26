import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build", // Gera os arquivos na pasta "build"
  },
  server: {
    host: "0.0.0.0", // Permite conexões externas
    port: process.env.PORT || 5173, // Usa a porta configurada no ambiente
    allowedHosts: [
      "digi-uckg.onrender.com", // Adiciona seu domínio Render
    ],
  },
});
