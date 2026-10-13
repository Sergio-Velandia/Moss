import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import NexusNavLink from '../components/nexus/NexusNavLink'
import { site } from '../data/site'
import Nexus from '../pages/Nexus'

const render = (node: React.ReactElement) => renderToString(createElement(MemoryRouter, null, node))

/** Todos los archivos de código de src/, con su contenido. */
function sourceFiles(dir = 'src'): [string, string][] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(ts|tsx)$/.test(name) && !name.endsWith('.test.ts') ? [[path, readFileSync(path, 'utf8')]] : []
  })
}

describe('Moss Nexus', () => {
  it('la URL vive en una sola constante, con https', () => {
    expect(site.nexusUrl).toMatch(/^https:\/\/.+\/$/)
    const repeated = sourceFiles()
      .filter(([path, code]) => !path.endsWith(join('data', 'site.ts')) && code.includes('Moss-Nexus'))
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
    const config = readFileSync('vite.config.ts', 'utf8')
    const routes = JSON.parse((/STATIC_ROUTES = (\[[^\]]*\])/.exec(config)?.[1] ?? '[]').replaceAll("'", '"')) as string[]
    const app = readFileSync('src/App.tsx', 'utf8')
    expect(routes).toContain('nexus')
    for (const route of routes) expect(app, route).toContain(`path="${route}"`)
  })
})
