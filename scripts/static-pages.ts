import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * GitHub Pages no conoce las rutas de React Router: sin una página por ruta, cada dirección responde 404
 * (aunque 404.html cargue la app y se vea bien) y los buscadores no la indexan. Tras el build se crea un
 * index.html por ruta, con su título y su descripción, para que responda 200 y se lea bien al compartirla.
 */

export interface StaticPage {
  /** Ruta relativa al sitio, sin barras al principio ni al final ('' es el inicio) */
  path: string
  title: string
  description: string
}

/** Dirección pública del sitio: la base de canonical, og:url y el sitemap */
export const SITE_URL = 'https://sergio-velandia.dev/Moss/'

/** URL canónica de una página, con barra final (así la sirve GitHub Pages) */
export const pageUrl = (path: string) => (path ? `${SITE_URL}${path}/` : SITE_URL)

/** Mismo formato que useDocumentTitle: «Título · Moss», y el nombre completo en el inicio */
export const pageTitle = (title?: string) => (title ? `${title} · Moss` : 'Moss — Digital Garden')

/** Las secciones de la app: su título es el mismo que pone cada página con useDocumentTitle */
export const SECTION_PAGES: StaticPage[] = [
  { path: 'rutas', title: 'Rutas', description: 'Recorridos ordenados que juntan guías, demos, retos y artículos de un tema, para aprenderlo de principio a fin.' },
  { path: 'laboratorio', title: 'El Laboratorio', description: 'Componentes, piezas de Tailwind y retos listos para probar, copiar y reutilizar.' },
  { path: 'manual', title: 'El Manual', description: 'Documentación técnica, configuraciones y guías que cuesta reconstruir.' },
  { path: 'bitacora', title: 'La Bitácora', description: 'Aprendizajes, decisiones y errores: la evolución detrás del código.' },
  { path: 'herbario', title: 'El Herbario', description: 'Busca en todo el jardín: demos, documentación y artículos, sin recordar dónde los guardaste.' },
  { path: 'proyectos', title: 'Proyectos', description: 'Cómo están armados mis proyectos por dentro: arquitectura, flujo de datos, decisiones y lo que aprendí.' },
  { path: 'nexus', title: 'Moss Nexus', description: 'Flujos de n8n listos para copiar: el proyecto hermano de Moss.' },
  { path: 'propon-una-idea', title: 'Propón una idea', description: 'Propón una guía, una ruta o un experimento para Moss, o escríbeme directamente.' },
]

/** Carpetas de contenido y la ruta bajo la que se publica cada documento */
const CONTENT: { folder: string; prefix: string; nested?: boolean }[] = [
  { folder: 'manual', prefix: 'manual', nested: true },
  { folder: 'journal', prefix: 'bitacora' },
  { folder: 'projects', prefix: 'proyectos' },
  { folder: 'routes', prefix: 'rutas' },
  { folder: 'legal', prefix: '' },
]

/** Lee title, description y draft del frontmatter de un Markdown de Moss (una línea por campo) */
export function readFrontmatter(raw: string): { title?: string; description?: string; draft: boolean } {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)?.[1] ?? ''
  const field = (name: string) => new RegExp(`^${name}:\\s*(.+)$`, 'm').exec(block)?.[1].trim()
  return { title: field('title'), description: field('description'), draft: field('draft') === 'true' }
}

const markdownFiles = (dir: string, nested: boolean): string[] => {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return nested ? markdownFiles(resolve(dir, entry.name), false).map((f) => `${entry.name}/${f}`) : []
    return entry.name.endsWith('.md') ? [entry.name] : []
  })
}

/** Una página por documento publicado y por demo del Laboratorio, sin mantener la lista a mano */
export function contentPages(root: string): StaticPage[] {
  const docs = CONTENT.flatMap(({ folder, prefix, nested }) => {
    const dir = resolve(root, 'content', folder)
    return markdownFiles(dir, Boolean(nested)).flatMap((file) => {
      const meta = readFrontmatter(readFileSync(resolve(dir, file), 'utf8'))
      if (meta.draft || !meta.title) return []
      const slug = file.replace(/\.md$/, '')
      return [{ path: prefix ? `${prefix}/${slug}` : slug, title: meta.title, description: meta.description ?? '' }]
    })
  })
  const labDir = resolve(root, 'src', 'lab', 'entries')
  const lab = existsSync(labDir)
    ? readdirSync(labDir)
        .filter((f) => f.endsWith('.tsx'))
        .map((f) => {
          const source = readFileSync(resolve(labDir, f), 'utf8')
          const text = (name: string) => new RegExp(`^\\s*${name}:\\s*'((?:[^'\\\\]|\\\\.)*)'`, 'm').exec(source)?.[1].replace(/\\'/g, "'")
          return { path: `laboratorio/${f.replace(/\.tsx$/, '')}`, title: text('title') ?? '', description: text('description') ?? '' }
        })
        .filter((p) => p.title)
    : []
  return [...docs, ...lab]
}

export const allPages = (root: string): StaticPage[] => [...SECTION_PAGES, ...contentPages(root)]

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Copia de index.html con el título, la descripción y la URL de la página en las etiquetas para buscadores y redes */
export function renderPage(html: string, page: StaticPage): string {
  const title = escapeHtml(pageTitle(page.title))
  const url = pageUrl(page.path)
  let out = html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${title}`)
  if (page.description) {
    const description = escapeHtml(page.description)
    out = out
      .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`)
      .replace(/(<meta property="og:description" content=")[^"]*/, `$1${description}`)
      .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${description}`)
  }
  return out
}

/** sitemap.xml con el inicio y todas las páginas, para que los buscadores las encuentren */
export function renderSitemap(pages: StaticPage[]): string {
  const urls = ['', ...pages.map((p) => p.path)].map((path) => `  <url><loc>${pageUrl(path)}</loc></url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}
