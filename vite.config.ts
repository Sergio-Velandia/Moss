import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  plugins: [react(), tailwindcss()],
  // GitHub Pages sirve el sitio en /Moss/ (el nombre del repositorio). En desarrollo se usa la raíz.
  // `vite preview` también cuenta como "serve": sin isPreview, buscaría los assets fuera de /Moss/.
  base: command === 'build' || isPreview ? '/Moss/' : '/',
}))
