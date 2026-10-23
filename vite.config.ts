import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import { allPages, renderPage, renderSitemap } from './scripts/static-pages.ts'

/**
 * Secciones que GitHub Pages sirve con código 200. Cada una, y cada documento y demo (ver scripts/static-pages.ts),
 * recibe en el build su propio index.html con su título y descripción. El 404.html del workflow queda solo para
 * direcciones que de verdad no existen.
 */
export const STATIC_ROUTES = ['rutas', 'laboratorio', 'manual', 'bitacora', 'herbario', 'proyectos', 'nexus', 'propon-una-idea', 'terminos', 'privacidad', 'proteccion-de-datos']

function staticRoutes(): Plugin {
  let outDir = 'dist'
  let root = process.cwd()
  return {
    name: 'moss-static-routes',
    apply: 'build',
    configResolved(config) {
      root = config.root
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const html = readFileSync(resolve(outDir, 'index.html'), 'utf8')
      const pages = allPages(root)
      const missing = STATIC_ROUTES.filter((r) => !pages.some((p) => p.path === r))
      if (missing.length) throw new Error(`Rutas sin página estática: ${missing.join(', ')}`)
      for (const page of pages) {
        mkdirSync(resolve(outDir, page.path), { recursive: true })
        writeFileSync(resolve(outDir, page.path, 'index.html'), renderPage(html, page))
      }
      writeFileSync(resolve(outDir, 'sitemap.xml'), renderSitemap(pages))
    },
  }
}

// La versión de Moss sale de package.json: la ficha del proyecto la muestra sin copiarla a mano
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

export default defineConfig(({ command, isPreview }) => ({
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [react(), tailwindcss(), staticRoutes()],
  // GitHub Pages sirve el sitio en /Moss/ (el nombre del repositorio). En desarrollo se usa la raíz.
  // `vite preview` también cuenta como "serve": sin isPreview, buscaría los assets fuera de /Moss/.
  base: command === 'build' || isPreview ? '/Moss/' : '/',
}))
