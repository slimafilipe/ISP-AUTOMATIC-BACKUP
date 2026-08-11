import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Em desenvolvimento local (npm run dev), o proxy redireciona /api para o backend.
// Para build de produção com Docker, o Nginx assume o papel de proxy reverso.
// Para empacotar no backend Spring Boot, defina a variável: VITE_BUILD_OUTDIR=spring
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    outDir: process.env.VITE_BUILD_OUTDIR === 'spring'
      ? path.resolve(__dirname, '../src/main/resources/static')
      : 'dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})