import { describe, expect, it } from 'vitest'
import { MANUAL_CATEGORY_NAMES, getManualDoc, journalPosts, manualDocs, parseReferences } from './content'
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

describe('referencias oficiales', () => {
  it('separa título y enlace y descarta lo que no es https', () => {
    expect(
      parseReferences(['Docs de n8n | https://docs.n8n.io/', 'Sin enlace', 'Inseguro | http://example.com', 'Roto | https://']),
    ).toEqual([{ title: 'Docs de n8n', url: 'https://docs.n8n.io/' }])
  })

  it('todas las guías del Manual enlazan su documentación oficial', () => {
    for (const d of manualDocs) expect(d.references.length, d.id).toBeGreaterThan(0)
  })
})

describe('contenido del jardín', () => {
  it('cada guía se encuentra a partir de su URL', () => {
    for (const d of manualDocs) {
      const [, , folder, slug] = d.url.split('/')
      expect(getManualDoc(folder, slug)?.id, d.url).toBe(d.id)
    }
  })

  it('cada carpeta del Manual tiene un nombre visible escrito a mano', () => {
    for (const d of manualDocs) {
      const folder = d.id.split('/')[1]
      expect(MANUAL_CATEGORY_NAMES[folder], folder).toBe(d.category)
    }
  })

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
