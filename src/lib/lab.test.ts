import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { knowledgeItems } from './knowledge'
import { labEntries } from './lab'

describe('demos del Laboratorio', () => {
  it.each(labEntries.map((e) => [e.slug, e] as const))('%s se renderiza sin errores', (_, entry) => {
    expect(renderToString(createElement(entry.Demo))).not.toBe('')
  })

  it('todas tienen metadatos completos', () => {
    for (const e of labEntries) {
      expect(e.title, e.slug).not.toBe('')
      expect(e.description, e.slug).not.toBe('')
      expect(e.createdAt, e.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('los relacionados existen y «Dónde lo uso» apunta a las apps reales', () => {
    const ids = new Set(knowledgeItems.map((i) => i.id))
    for (const e of labEntries) {
      for (const r of e.related ?? []) expect(ids.has(r), `${e.slug} → ${r}`).toBe(true)
      for (const u of e.usedIn ?? []) expect(u.url, e.slug).toMatch(/^https:\/\/sergio-velandia\.dev\//)
    }
  })

  it('las categorías agrupan: ninguna tiene una sola demo', () => {
    const counts = new Map<string, number>()
    for (const e of labEntries) counts.set(e.category, (counts.get(e.category) ?? 0) + 1)
    const alone = [...counts].filter(([, n]) => n < 2).map(([c]) => c)
    expect(alone).toEqual([])
  })

  it('las Piezas Tailwind traen notas, uso real y un manual o bitácora que las explique', () => {
    const pieces = labEntries.filter((e) => e.category === 'Piezas Tailwind')
    for (const e of pieces) {
      expect(e.notes?.length, e.slug).toBeGreaterThan(0)
      expect(e.usedIn?.length, e.slug).toBeGreaterThan(0)
      expect(e.related?.some((r) => r.startsWith('manual/') || r.startsWith('journal/')), e.slug).toBe(true)
    }
  })
})
