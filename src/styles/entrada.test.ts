// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Se lee con Vite (?raw), igual que el resto de pruebas de src. El CSS se prueba en scripts/entrada-css.test.ts:
// Vitest vacía los .css aunque se importen en crudo.
const html = import.meta.glob<string>('/index.html', { eager: true, query: '?raw', import: 'default' })['/index.html']

const BASE = '/Moss/'
const plantilla = /<template id="plantilla-entrada">[\s\S]*?<\/template>/.exec(html)?.[0] ?? ''
const script = /<\/template>\s*<script>([\s\S]*?)<\/script>/.exec(html)?.[1]?.replaceAll('%BASE_URL%', BASE) ?? ''

interface Llegada {
  ruta?: string
  referente?: string
  tipo?: string
  movimientoReducido?: boolean
}

function llegar({ ruta = BASE, referente = '', tipo = 'navigate', movimientoReducido = false }: Llegada = {}) {
  window.history.replaceState(null, '', ruta)
  Object.defineProperty(document, 'referrer', { value: referente, configurable: true })
  vi.stubGlobal('matchMedia', () => ({ matches: movimientoReducido }))
  vi.spyOn(performance, 'getEntriesByType').mockReturnValue([{ type: tipo }] as unknown as PerformanceEntryList)
  new Function(script)()
  return document.querySelector<HTMLElement>('.entrada')
}

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
  document.head.innerHTML = '<meta name="theme-color" content="#faf7ef" />'
  document.body.innerHTML = plantilla
})

afterEach(() => {
  document.querySelector('.entrada')?.remove()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('pantalla de entrada: cuándo aparece', () => {
  it('aparece al llegar de afuera, sin leerla el lector de pantalla', () => {
    const entrada = llegar({ referente: 'https://www.google.com/' })
    expect(entrada).not.toBeNull()
    expect(entrada?.getAttribute('aria-hidden')).toBe('true')
  })

  it('aparece también al venir de Moss Nexus, que comparte dominio', () => {
    expect(llegar({ referente: `${location.origin}/Moss-Nexus/plantillas/` })).not.toBeNull()
  })

  it('no aparece al recargar ni al volver atrás', () => {
    expect(llegar({ tipo: 'reload' })).toBeNull()
    expect(llegar({ tipo: 'back_forward' })).toBeNull()
  })

  it('no aparece al abrir otra página del mismo sitio', () => {
    expect(llegar({ referente: `${location.origin}${BASE}manual/` })).toBeNull()
  })

  it('no aparece a quien viene a una sección concreta', () => {
    expect(llegar({ ruta: `${BASE}manual/n8n/orquestacion-y-manejo-de-errores/#capa-3` })).toBeNull()
  })

  it('no aparece con movimiento reducido', () => {
    expect(llegar({ movimientoReducido: true })).toBeNull()
  })

  it('si el navegador no da los datos de la navegación, no rompe la página', () => {
    window.history.replaceState(null, '', BASE)
    vi.spyOn(performance, 'getEntriesByType').mockImplementation(() => {
      throw new Error('no disponible')
    })
    expect(() => new Function(script)()).not.toThrow()
    expect(document.querySelector('.entrada')).toBeNull()
  })
})

describe('pantalla de entrada: su contenido', () => {
  it('los granos caben en la marca de 128 px', () => {
    const granos = [...(llegar()?.querySelectorAll<HTMLElement>('.entrada-grano') ?? [])]
    expect(granos.length).toBe(70)
    for (const g of granos) {
      expect(Math.abs(parseFloat(g.style.getPropertyValue('--x')))).toBeLessThanOrEqual(64)
      expect(Math.abs(parseFloat(g.style.getPropertyValue('--y')))).toBeLessThanOrEqual(64)
    }
  })

  it('el lema sigue el idioma, con el mismo orden que la interfaz y sin guardar nada', () => {
    const lema = () => document.querySelector('.entrada-lema')?.textContent
    llegar()
    expect(lema()).toBe('Jardín digital')
    document.querySelector('.entrada')?.remove()

    localStorage.setItem('moss-lang', 'en')
    llegar()
    expect(lema()).toBe('Digital garden')
    document.querySelector('.entrada')?.remove()

    llegar({ ruta: `${BASE}?lang=es` })
    expect(lema()).toBe('Jardín digital')
    expect(script).not.toMatch(/setItem|sessionStorage|cookie/)
  })
})

describe('pantalla de entrada: cuándo se va', () => {
  it('se va sola a los 3 segundos como mucho y devuelve el color del navegador', () => {
    llegar()
    const color = document.querySelector('meta[name=theme-color]')
    expect(color?.getAttribute('content')).toBe('#141a13')
    vi.advanceTimersByTime(2999)
    expect(document.querySelector('.entrada')).not.toBeNull()
    vi.advanceTimersByTime(1)
    expect(document.querySelector('.entrada')).toBeNull()
    expect(color?.getAttribute('content')).toBe('#faf7ef')
  })

  it('se va al terminar su animación, no la de un hijo', () => {
    const entrada = llegar()
    entrada?.querySelector('.entrada-lema')?.dispatchEvent(new Event('animationend', { bubbles: true }))
    expect(document.querySelector('.entrada')).not.toBeNull()
    entrada?.dispatchEvent(new Event('animationend'))
    expect(document.querySelector('.entrada')).toBeNull()
  })

  it.each([
    ['un toque', 'pointerdown'],
    ['una tecla', 'keydown'],
  ])('se salta con %s', (_nombre, evento) => {
    llegar()
    window.dispatchEvent(new Event(evento))
    expect(document.querySelector('.entrada')).toBeNull()
  })
})

describe('pantalla de entrada: el diseño', () => {
  it('no tiene títulos ni elementos con foco que estorben a la página', () => {
    expect(plantilla).not.toMatch(/<(h[1-6]|a|button|input)\b/)
  })
})
