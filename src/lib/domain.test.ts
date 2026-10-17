import { describe, expect, it } from 'vitest'
import { site } from '../data/site'

// Código y contenido leídos con Vite (?raw), como en el resto de pruebas
const files = import.meta.glob<string>(['/src/**/*.{ts,tsx}', '/content/**/*.md', '!/src/**/*.test.ts'], {
  eager: true,
  query: '?raw',
  import: 'default',
})

describe('dominio propio', () => {
  it('los sitios del ecosistema usan sergio-velandia.dev', () => {
    expect(site.portfolioUrl).toMatch(/^https:\/\/sergio-velandia\.dev\//)
    expect(site.nexusUrl).toMatch(/^https:\/\/sergio-velandia\.dev\//)
  })

  it('no quedan URLs antiguas de github.io', () => {
    expect(Object.keys(files).length).toBeGreaterThan(50)
    const old = Object.entries(files)
      .filter(([, text]) => text.includes('sergio-velandia.github.io'))
      .map(([path]) => path)
    expect(old).toEqual([])
  })
})
