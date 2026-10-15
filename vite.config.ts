import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

/**
 * Rutas que GitHub Pages debe servir con código 200. Para el resto, el workflow copia index.html como
 * 404.html: la página se ve bien, pero responde 404. Añade aquí las rutas pensadas para compartirse.
 */
export const STATIC_ROUTES = ['nexus', 'proyectos', 'rutas']

/** Carpetas de contenido cuyas páginas responden 200, con la ruta bajo la que se publican */
const CONTENT_ROUTES: Record<string, string> = { projects: 'proyectos', routes: 'rutas' }

/** Una ruta por documento publicado de esas carpetas (content/<carpeta>/<slug>.md), sin mantener la lista a mano. */
function contentRoutes(root: string): string[] {
  return Object.entries(CONTENT_ROUTES).flatMap(([folder, prefix]) => {
    const dir = resolve(root, 'content', folder)
    if (!existsSync(dir)) return []
    return readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      // Los borradores no se publican: tampoco necesitan página estática
      .filter((f) => !/^draft:\s*true\s*$/m.test(readFileSync(resolve(dir, f), 'utf8')))
      .map((f) => `${prefix}/${f.replace(/\.md$/, '')}`)
  })
}

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
    // Cada ruta recibe una copia de index.html en <ruta>/index.html
    closeBundle() {
      for (const route of [...STATIC_ROUTES, ...contentRoutes(root)]) {
        mkdirSync(resolve(outDir, route), { recursive: true })
        copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, route, 'index.html'))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  plugins: [react(), tailwindcss(), staticRoutes()],
  // GitHub Pages sirve el sitio en /Moss/ (el nombre del repositorio). En desarrollo se usa la raíz.
  // `vite preview` también cuenta como "serve": sin isPreview, buscaría los assets fuera de /Moss/.
  base: command === 'build' || isPreview ? '/Moss/' : '/',
}))
