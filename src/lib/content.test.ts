import { describe, expect, it } from 'vitest'
import { journalPosts, manualDocs } from './content'
import { parseFrontmatter } from './frontmatter'
import { knowledgeItems } from './knowledge'

describe('frontmatter', () => {
  it('lee texto, listas y booleanos', () => {
    const { data, body } = parseFrontmatter('---\ntitle: Hola: mundo\ntags: [a, "b c"]\ndraft: true\n---\nTexto')
    expect(data).toEqual({ title: 'Hola: mundo', tags: ['a', 'b c'], draft: true })
    expect(body).toBe('Texto')
  })

  it('devuelve el texto intacto si no hay frontmatter', () => {
    expect(parseFrontmatter('solo texto')).toEqual({ data: {}, body: 'solo texto' })
  })
})

describe('contenido del jardín', () => {
  it('todos los documentos tienen título y descripción', () => {
    for (const d of [...manualDocs, ...journalPosts]) {
      expect(d.title, d.id).not.toBe(d.slug)
      expect(d.description, d.id).not.toBe('')
    }
  })

  it('ningún enlace "related" apunta a algo que no existe', () => {
    const ids = new Set(knowledgeItems.map((i) => i.id))
    for (const d of [...manualDocs, ...journalPosts]) {
      for (const r of d.related) expect(ids.has(r), `${d.id} → ${r}`).toBe(true)
    }
  })

  it('los ids son únicos', () => {
    const ids = knowledgeItems.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
