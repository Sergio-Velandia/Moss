import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { allPages, pageTitle, readFrontmatter, renderPage } from './static-pages.ts'

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
