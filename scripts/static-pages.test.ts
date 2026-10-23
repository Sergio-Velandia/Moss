import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { allPages, pageTitle, pageUrl, readFrontmatter, renderPage, renderSitemap, SITE_URL } from './static-pages.ts'

const root = resolve(import.meta.dirname, '..')
const pages = allPages(root)
const paths = new Set(pages.map((p) => p.path))

describe('páginas estáticas', () => {
  it('cubre las secciones, cada tipo de contenido y las páginas legales', () => {
    for (const p of ['rutas', 'laboratorio', 'manual', 'bitacora', 'herbario', 'proyectos', 'nexus', 'propon-una-idea', 'terminos', 'privacidad', 'proteccion-de-datos']) {
      expect(paths, p).toContain(p)
    }
    expect(paths).toContain('manual/n8n/instalar-n8n')
    expect(paths).toContain('bitacora/versionar-despues')
    expect(paths).toContain('laboratorio/pieza-botones')
    expect(paths).toContain('rutas/n8n-de-cero-a-produccion')
    expect(paths).toContain('proyectos/moss-nexus')
  })

  it('cada página tiene título y no se repite ninguna ruta', () => {
    for (const p of pages) expect(p.title, p.path).not.toBe('')
    expect(paths.size).toBe(pages.length)
  })

  it('lee el frontmatter y respeta los borradores', () => {
    expect(readFrontmatter('---\ntitle: Hola: mundo\ndescription: Una frase.\n---\nCuerpo')).toEqual({ title: 'Hola: mundo', description: 'Una frase.', draft: false })
    expect(readFrontmatter('---\r\ntitle: X\r\ndraft: true\r\n---').draft).toBe(true)
  })

  it('cambia el título y la descripción del HTML, escapando lo que haga falta', () => {
    const html = '<title>Moss — Digital Garden</title><meta name="description" content="general" />'
    const out = renderPage(html, { path: 'x', title: 'A & "B"', description: 'Uso <b>' })
    expect(out).toContain(`<title>${pageTitle('A &amp; &quot;B&quot;')}</title>`)
    expect(out).toContain('content="Uso &lt;b&gt;"')
  })
})

describe('metadatos para compartir', () => {
  const index = readFileSync(resolve(root, 'index.html'), 'utf8')

  it('index.html declara canonical, Open Graph y Twitter Card con el dominio del sitio', () => {
    for (const tag of ['rel="canonical"', 'og:type', 'og:url', 'og:title', 'og:description', 'og:image', 'twitter:card', 'twitter:image']) {
      expect(index, tag).toContain(tag)
    }
    expect(index).toContain(`<link rel="canonical" href="${SITE_URL}" />`)
    expect(index).toContain(`content="${SITE_URL}og.png"`)
    expect(index).toContain('content="summary_large_image"')
  })

  it('og.png existe y mide lo que declaran las etiquetas', () => {
    const png = readFileSync(resolve(root, 'public', 'og.png'))
    expect(png.subarray(1, 4).toString()).toBe('PNG')
    const width = /og:image:width" content="(\d+)/.exec(index)?.[1]
    const height = /og:image:height" content="(\d+)/.exec(index)?.[1]
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([Number(width), Number(height)])
    expect(png.length).toBeLessThan(1024 * 1024)
  })

  it('cada página lleva su URL canónica y su título en las etiquetas sociales', () => {
    const out = renderPage(index, { path: 'manual/n8n/instalar-n8n', title: 'Instalar n8n', description: 'Una guía.' })
    const url = `${SITE_URL}manual/n8n/instalar-n8n/`
    expect(out).toContain(`<link rel="canonical" href="${url}" />`)
    expect(out).toContain(`<meta property="og:url" content="${url}" />`)
    expect(out).toContain(`<meta property="og:title" content="${pageTitle('Instalar n8n')}" />`)
    expect(out).toContain(`<meta name="twitter:description" content="Una guía." />`)
    expect(pageUrl('')).toBe(SITE_URL)
  })

  it('el sitemap lista el inicio y cada página con su URL canónica', () => {
    const xml = renderSitemap(pages)
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/)
    expect(xml).toContain(`<loc>${SITE_URL}</loc>`)
    expect(xml).toContain(`<loc>${SITE_URL}rutas/css-y-tailwind/</loc>`)
    expect(xml.match(/<loc>/g)).toHaveLength(pages.length + 1)
  })
})
