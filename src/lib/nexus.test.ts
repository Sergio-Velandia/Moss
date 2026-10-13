import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import NexusNavLink from '../components/nexus/NexusNavLink'
import { site } from '../data/site'
import Nexus from '../pages/Nexus'

const render = (node: React.ReactElement) => renderToString(createElement(MemoryRouter, null, node))

// El código se lee con Vite (?raw), igual que el resto del sitio: sin APIs de Node, que el build no tipa
const sources = import.meta.glob<string>(['/src/**/*.{ts,tsx}', '!/src/**/*.test.ts'], {
  eager: true,
  query: '?raw',
  import: 'default',
})
const appSource = sources['/src/App.tsx']
const viteConfig = import.meta.glob<string>('/vite.config.ts', { eager: true, query: '?raw', import: 'default' })[
  '/vite.config.ts'
]

describe('Moss Nexus', () => {
  it('la URL vive en una sola constante, con https', () => {
    expect(site.nexusUrl).toMatch(/^https:\/\/.+\/$/)
    expect(Object.keys(sources).length).toBeGreaterThan(20)
    const repeated = Object.entries(sources)
      .filter(([path, code]) => path !== '/src/data/site.ts' && code.includes('Moss-Nexus'))
      .map(([path]) => path)
    expect(repeated).toEqual([])
  })

  it('la página enlaza a Nexus de forma segura y muestra el aviso de independencia', () => {
    const html = render(createElement(Nexus))
    const links = [...html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>/g)].filter(([, href]) => href === site.nexusUrl)
    expect(links.length).toBeGreaterThan(0)
    for (const [tag] of links) {
      expect(tag).toContain('rel="noopener noreferrer"')
      expect(tag).toContain('target="_blank"')
    }
    expect(html).toContain('Ir a Moss Nexus')
    expect(html).toContain('sin relación oficial con n8n GmbH')
  })

  it('el acceso de la navegación lleva a /nexus en la cabecera y en el menú', () => {
    for (const variant of ['header', 'menu'] as const) {
      const html = render(createElement(NexusNavLink, { variant }))
      expect(html).toMatch(/href="\/nexus"/)
      expect(html).toContain('Nexus')
    }
  })

  it('cada ruta estática del build existe en el router', () => {
    const routes = JSON.parse((/STATIC_ROUTES = (\[[^\]]*\])/.exec(viteConfig)?.[1] ?? '[]').replaceAll("'", '"')) as string[]
    expect(routes).toContain('nexus')
    for (const route of routes) expect(appSource, route).toContain(`path="${route}"`)
  })
})
