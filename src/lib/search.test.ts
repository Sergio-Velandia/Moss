import { describe, expect, it } from 'vitest'
import { search } from './search'

const ids = (q: string) => search(q).map((i) => i.id)

// Consultas de ejemplo del documento de diseño de Moss
describe('búsqueda global del Herbario', () => {
  it('encuentra la demo por "animación de entrada"', () => {
    expect(ids('animación de entrada')[0]).toBe('lab/fade-in-list')
  })

  it('ignora las tildes: "animacion" equivale a "animación"', () => {
    expect(ids('animacion')).toContain('lab/fade-in-list')
  })

  it('encuentra el documento de Gemini por "conectar Gemini"', () => {
    expect(ids('conectar Gemini')[0]).toBe('manual/apis/conectar-gemini')
  })

  it('encuentra el documento SQL por "consulta SQL para agrupar"', () => {
    expect(ids('consulta SQL para agrupar')[0]).toBe('manual/sql/agrupar-con-group-by')
  })

  it('encuentra la guía de n8n por "webhook de n8n" (la demo del generador de payloads también vale)', () => {
    expect(ids('webhook de n8n').slice(0, 2)).toContain('manual/n8n/entender-webhooks-y-triggers')
    expect(ids('webhook de n8n').find((id) => id.startsWith('manual/'))).toBe('manual/n8n/entender-webhooks-y-triggers')
  })

  it('encuentra la estructura de React por "estructura de proyecto React"', () => {
    expect(ids('estructura de proyecto React')[0]).toBe('manual/react/estructura-de-proyecto')
  })

  it('busca dentro del código de una demo', () => {
    expect(ids('perspective')).toContain('lab/tilt-card')
  })

  it('devuelve vacío para una búsqueda vacía o sin coincidencias', () => {
    expect(search('   ')).toEqual([])
    expect(search('zzzxqwv')).toEqual([])
  })
})
