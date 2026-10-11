import { describe, expect, it } from 'vitest'
import { manualDocs } from './content'
import { isDiagramLanguage, parseDiagram, parseFlow, parseMindmap, parseNode } from './diagram'

describe('parseNode', () => {
  it('separa título y detalle', () => {
    expect(parseNode(' Webhook :: recibe el POST ')).toEqual({ title: 'Webhook', detail: 'recibe el POST', kind: 'default' })
  })

  it('lee el tipo por el prefijo', () => {
    expect(parseNode('? ¿Válido?').kind).toBe('decision')
    expect(parseNode('+ Responder 201').kind).toBe('success')
    expect(parseNode('! Responder 400').kind).toBe('error')
    // Un "?" pegado al texto es parte del título, no un prefijo
    expect(parseNode('¿Válido?')).toEqual({ title: '¿Válido?', kind: 'default' })
  })
})

describe('parseFlow', () => {
  it('lee el título, los pasos y las ramas paralelas', () => {
    const flow = parseFlow('# Validar\n\nWebhook :: POST\n? ¿Válido?\n+ 201 | ! 400 :: con errores\n')
    expect(flow.caption).toBe('Validar')
    expect(flow.steps.map((s) => s.map((n) => n.title))).toEqual([['Webhook'], ['¿Válido?'], ['201', '400']])
    expect(flow.steps[2][1]).toEqual({ title: '400', detail: 'con errores', kind: 'error' })
  })
})

describe('parseMindmap', () => {
  it('lee el centro, las ramas y sus hijos', () => {
    const map = parseMindmap('Fetch\n- Errores :: res.ok\n  - 404\n  - 500\n- Tiempo límite\n')
    expect(map.center.title).toBe('Fetch')
    expect(map.branches.map((b) => [b.title, b.children.map((c) => c.title)])).toEqual([
      ['Errores', ['404', '500']],
      ['Tiempo límite', []],
    ])
    expect(map.branches[0].detail).toBe('res.ok')
  })
})

describe('diagramas del Manual', () => {
  const blocks = manualDocs.flatMap((d) =>
    [...d.body.matchAll(/```(\w+)\r?\n([\s\S]*?)```/g)]
      .filter(([, lang]) => isDiagramLanguage(lang))
      .map(([, lang, source]) => ({ id: d.id, diagram: parseDiagram(lang as 'flow' | 'mindmap', source) })),
  )

  it('cada guía tiene al menos un diagrama', () => {
    for (const d of manualDocs) expect(blocks.some((b) => b.id === d.id), d.id).toBe(true)
  })

  it('ningún diagrama está vacío ni demasiado ancho', () => {
    for (const { id, diagram } of blocks) {
      if (diagram.type === 'flow') {
        expect(diagram.steps.length, id).toBeGreaterThan(1)
        for (const step of diagram.steps) expect(step.length, id).toBeLessThanOrEqual(3)
      } else {
        expect(diagram.center.title, id).not.toBe('')
        expect(diagram.branches.length, id).toBeGreaterThan(1)
        expect(diagram.branches.length, id).toBeLessThanOrEqual(4)
      }
    }
  })
})
