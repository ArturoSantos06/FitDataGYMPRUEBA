import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // ¡Importante! La base desde donde Django servirá los archivos
  // (Netlify ignora esto, pero es bueno tenerlo consistente)
  base: '/', 

  build: {
    manifest: true,  
    outDir: './dist', 
    rollupOptions: {
      input: './src/main.jsx', 
    },
  },
})