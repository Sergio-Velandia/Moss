import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
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
})
