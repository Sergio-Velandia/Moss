import { describe, expect, it } from 'vitest'
import {
  MIN_REAL_ITEMS,
  byMonth,
  byTechnology,
  byType,
  createMockItems,
  getGardenItems,
  monthKey,
  selectItems,
  type GardenItem,
  type GardenType,
} from './dashboard'

let n = 0
const item = (createdAt: string, technologies: string[] = [], type: GardenType = 'manual'): GardenItem => ({
  id: `t/${n++}`,
  title: 'Prueba',
  createdAt,
  type,
  technologies,
})

// Mes 9 = octubre (los meses de Date empiezan en 0)
const oct15 = new Date(2026, 9, 15)

describe('monthKey', () => {
  it('lee la fecha en local: el día 1 no cae en el mes anterior', () => {
    expect(monthKey('2026-10-01')).toBe(2026 * 12 + 9)
    expect(monthKey('2026-01-01')).toBe(2026 * 12)
  })

  it('rechaza fechas mal formadas', () => {
    expect(monthKey('2026-13-01')).toBeNull()
    expect(monthKey('10/01/2026')).toBeNull()
    expect(monthKey('')).toBeNull()
  })
})

describe('byMonth', () => {
  it('rellena con 0 los meses sin contenido, hasta el mes actual', () => {
    const months = byMonth([item('2026-07-03'), item('2026-07-20'), item('2026-09-30')], oct15)
    expect(months.map((m) => [m.label, m.count])).toEqual([
      ['jul', 2],
      ['ago', 0],
      ['sep', 1],
      ['oct', 0],
    ])
    expect(months.at(-1)).toMatchObject({ key: '2026-10', fullLabel: 'octubre de 2026', isCurrent: true })
    expect(months.filter((m) => m.isCurrent)).toHaveLength(1)
  })

  it('cruza el cambio de año', () => {
    const months = byMonth([item('2025-12-31'), item('2026-01-01')], new Date(2026, 1, 1))
    expect(months.map((m) => [m.key, m.count])).toEqual([
      ['2025-12', 1],
      ['2026-01', 1],
      ['2026-02', 0],
    ])
  })

  it('muestra como mucho los últimos 12 meses', () => {
    const months = byMonth([item('2024-03-10'), item('2026-10-01')], oct15)
    expect(months).toHaveLength(12)
    expect(months[0].key).toBe('2025-11')
    expect(months.reduce((sum, m) => sum + m.count, 0)).toBe(1)
  })

  it('ignora fechas futuras e inválidas', () => {
    expect(byMonth([item('2026-11-02'), item('sin fecha')], oct15)).toEqual([])
  })

  it('con la lista vacía no devuelve meses', () => {
    expect(byMonth([], oct15)).toEqual([])
  })
})

describe('byTechnology', () => {
  it('une alias y mayúsculas, y cuenta cada elemento una sola vez', () => {
    const stats = byTechnology([
      item('2026-10-01', ['react', 'React.js', 'TS']),
      item('2026-10-01', ['React', 'SQL']),
      item('2026-10-01', ['REACT', 'typescript']),
      item('2026-10-01', ['Supabase', 'supabase']),
    ])
    expect(stats.map((s) => [s.technology, s.count])).toEqual([
      ['React', 3],
      ['TypeScript', 2],
      ['SQL', 1],
      ['Supabase', 1],
    ])
  })

  it('normaliza a 0-100 respecto a la más frecuente', () => {
    const stats = byTechnology([
      item('2026-10-01', ['CSS', 'Git']),
      item('2026-10-01', ['CSS']),
      item('2026-10-01', ['CSS']),
      item('2026-10-01', ['CSS']),
    ])
    expect(stats.map((s) => s.value)).toEqual([100, 25])
  })

  it('se queda con el top pedido', () => {
    const techs = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
    expect(byTechnology([item('2026-10-01', techs)])).toHaveLength(7)
    expect(byTechnology([item('2026-10-01', techs)], 6)).toHaveLength(6)
  })

  it('con la lista vacía devuelve un arreglo vacío', () => {
    expect(byTechnology([])).toEqual([])
  })
})

describe('byType', () => {
  it('cuenta por tipo y los porcentajes suman 100', () => {
    const stats = byType([
      item('2026-10-01', [], 'laboratorio'),
      item('2026-10-01', [], 'manual'),
      item('2026-10-01', [], 'bitacora'),
    ])
    expect(stats.map((s) => s.count)).toEqual([1, 1, 1])
    expect(stats.reduce((sum, s) => sum + s.percent, 0)).toBe(100)
  })

  it('con la lista vacía todo vale 0', () => {
    expect(byType([]).map((s) => [s.type, s.count, s.percent])).toEqual([
      ['laboratorio', 0, 0],
      ['manual', 0, 0],
      ['bitacora', 0, 0],
    ])
  })
})

describe('datos de ejemplo', () => {
  const real = Array.from({ length: MIN_REAL_ITEMS }, () => item('2026-10-01'))

  it('se usan solo con menos de 10 elementos reales', () => {
    expect(selectItems(real.slice(0, MIN_REAL_ITEMS - 1)).isMock).toBe(true)
    expect(selectItems([]).isMock).toBe(true)
    expect(selectItems(real)).toEqual({ items: real, isMock: false })
  })

  it('cubren entre 6 y 8 meses y terminan en el mes actual, sin fechas futuras', () => {
    const mock = createMockItems(oct15)
    expect(mock.length).toBeGreaterThanOrEqual(24)
    expect(mock.length).toBeLessThanOrEqual(30)
    const months = byMonth(mock, oct15)
    expect(months.length).toBeGreaterThanOrEqual(6)
    expect(months.length).toBeLessThanOrEqual(8)
    expect(months.at(-1)!.count).toBeGreaterThan(0)
    expect(mock.every((m) => m.createdAt <= '2026-10-15')).toBe(true)
  })

  it('no mutan la entrada al agregar', () => {
    const mock = createMockItems(oct15)
    const copy = structuredClone(mock)
    byTechnology(mock)
    byMonth(mock, oct15)
    byType(mock)
    expect(mock).toEqual(copy)
  })
})

describe('contenido real', () => {
  it('incluye las tres secciones con ids únicos', () => {
    const items = getGardenItems()
    expect(new Set(items.map((i) => i.type))).toEqual(new Set(['laboratorio', 'manual', 'bitacora']))
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length)
  })
})
