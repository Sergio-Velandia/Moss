import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')
const css = readFileSync(resolve(root, 'src/styles/entrada.css'), 'utf8').replace(/\r\n/g, '\n')
const tokens = readFileSync(resolve(root, 'src/index.css'), 'utf8')

const color = (token: string) => new RegExp(`--c-entrada-${token}:\\s*(#[0-9a-f]{6})`, 'i').exec(tokens)?.[1] ?? ''

function luminancia(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

describe('pantalla de entrada: el diseño', () => {
  it('sus animaciones terminan antes de los 3 segundos', () => {
    const duracion = Number(/--entrada-duracion:\s*(\d+)ms/.exec(css)?.[1])
    expect(duracion).toBeGreaterThan(0)
    expect(duracion).toBeLessThanOrEqual(3000)
    // Las capas con su propio tiempo tampoco se pasan: retraso + duración.
    const capas = [...css.matchAll(/animation-delay: (\d+)ms;\s*animation-duration: (\d+)ms/g)]
    expect(capas.length).toBeGreaterThan(0)
    for (const [, retraso, propia] of capas) expect(Number(retraso) + Number(propia)).toBeLessThanOrEqual(duracion)
  })

  it('solo anima transform y opacity', () => {
    const fotogramas = [...css.matchAll(/@keyframes [\w-]+ \{([\s\S]*?)\n\}/g)].map((m) => m[1] ?? '')
    expect(fotogramas.length).toBeGreaterThan(0)
    const propiedades = new Set(fotogramas.flatMap((f) => [...f.matchAll(/^\s*([a-z-]+):/gm)].map((m) => m[1])))
    expect([...propiedades].sort()).toEqual(['opacity', 'transform'])
  })

  it('no usa hex sueltos: los colores viven en los tokens', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i)
  })

  it.each([
    ['texto', 4.5],
    ['lema', 4.5],
    ['grano', 3],
  ] as const)('el %s contrasta con el fondo', (nombre, minimo) => {
    const [claro = 0, oscuro = 0] = [luminancia(color(nombre)), luminancia(color('fondo'))].sort((x, y) => y - x)
    expect((claro + 0.05) / (oscuro + 0.05)).toBeGreaterThanOrEqual(minimo)
  })
})
