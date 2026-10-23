import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import ProjectFacts from '../components/content/ProjectFacts'
import { PROJECT_SECTIONS, projectDocs, sectionBody, validateProject, type Doc } from './content'
import { getGardenItems } from './dashboard'
import { isDiagramLanguage, parseDiagram } from './diagram'
import { knowledgeItems } from './knowledge'

const appSource = import.meta.glob<string>('/src/App.tsx', { eager: true, query: '?raw', import: 'default' })['/src/App.tsx']

describe('proyectos documentados', () => {
  it('existen los tres y todos cumplen la plantilla', () => {
    expect(projectDocs.map((p) => p.slug).sort()).toEqual(['moss', 'moss-nexus', 'portafolio'])
    expect(Object.fromEntries(projectDocs.map((p) => [p.slug, p.project!.theme]))).toEqual({
      moss: 'moss',
      'moss-nexus': 'nexus',
      portafolio: 'portafolio',
    })
    for (const p of projectDocs) expect(validateProject(p), p.id).toEqual([])
  })

  it('la ficha muestra «Documentado en vX.Y.Z» y «Última revisión»', () => {
    for (const p of projectDocs) {
      const html = renderToString(createElement(ProjectFacts, { facts: p.project! }))
      expect(html, p.id).toContain('Documentado en')
      expect(html, p.id).toContain(`v${p.project!.version}`)
      expect(html, p.id).toContain('Última revisión')
      expect(html, p.id).toContain(`dateTime="${p.project!.reviewedAt}"`)
      expect(html, p.id).toContain('rel="noopener noreferrer"')
    }
  })

  it('sus diagramas se pueden dibujar', () => {
    for (const p of projectDocs) {
      const blocks = [...p.body.matchAll(/```(\w+)\r?\n([\s\S]*?)```/g)].filter(([, lang]) => isDiagramLanguage(lang))
      expect(blocks.length, p.id).toBeGreaterThanOrEqual(2)
      for (const [, lang, source] of blocks) {
        const d = parseDiagram(lang as 'flow' | 'mindmap', source)
        if (d.type === 'flow') {
          expect(d.steps.length, p.id).toBeGreaterThan(1)
          for (const step of d.steps) expect(step.length, p.id).toBeLessThanOrEqual(3)
        } else {
          expect(d.branches.length, p.id).toBeGreaterThanOrEqual(2)
          expect(d.branches.length, p.id).toBeLessThanOrEqual(4)
        }
      }
    }
  })

  it('sus relacionados apuntan a contenido que existe', () => {
    const ids = new Set(knowledgeItems.map((i) => i.id))
    for (const p of projectDocs) {
      expect(p.related.length, p.id).toBeGreaterThan(0)
      for (const r of p.related) expect(ids.has(r), `${p.id} → ${r}`).toBe(true)
    }
  })
})

describe('validateProject', () => {
  const base = projectDocs.find((p) => p.slug === 'moss')!
  const withFacts = (patch: Partial<NonNullable<Doc['project']>>): Doc => ({ ...base, project: { ...base.project!, ...patch } })

  it('falla si falta la versión o la fecha de revisión', () => {
    expect(validateProject(withFacts({ version: '' })).join()).toMatch(/version/)
    expect(validateProject(withFacts({ version: '1.6' })).join()).toMatch(/version/)
    expect(validateProject(withFacts({ reviewedAt: '' })).join()).toMatch(/reviewedAt/)
    expect(validateProject(withFacts({ reviewedAt: '12/10/2026' })).join()).toMatch(/reviewedAt/)
  })

  it('exige estado y tema conocidos, y enlaces https', () => {
    expect(validateProject(withFacts({ status: 'terminado' })).join()).toMatch(/status/)
    expect(validateProject(withFacts({ theme: 'sandia' })).join()).toMatch(/theme/)
    expect(validateProject(withFacts({ repo: 'http://github.com/x' })).join()).toMatch(/repo/)
    expect(validateProject(withFacts({ site: '' })).join()).toMatch(/site/)
  })

  it('exige las secciones en orden', () => {
    const shuffled = { ...base, headings: [...base.headings].reverse() }
    expect(validateProject(shuffled).join()).toMatch(/secciones/)
    const missing = { ...base, headings: base.headings.filter((h) => h.text !== 'Lecciones') }
    expect(validateProject(missing).join()).toMatch(/secciones/)
    expect(PROJECT_SECTIONS).toContain('Lecciones')
  })

  it('exige al menos cuatro decisiones con su formato y un diagrama por sección', () => {
    // Finales de línea normalizados: en Windows, Git puede entregar los .md con CRLF
    const body = base.body.replace(/\r\n/g, '\n')
    const decisions = sectionBody(body, 'Decisiones')
    expect(decisions.length).toBeGreaterThan(0)
    const fewer = { ...base, body: body.replace(decisions, '\n- **Decisión:** a **En vez de:** b **Porque:** c\n') }
    expect(validateProject(fewer).join()).toMatch(/Decisiones/)
    const noDiagram = { ...base, body: base.body.replace(/```mindmap/g, '```text') }
    expect(validateProject(noDiagram).join()).toMatch(/Arquitectura/)
  })
})

describe('integración', () => {
  it('el Herbario los indexa como proyectos', () => {
    const projects = knowledgeItems.filter((i) => i.type === 'project')
    expect(projects.map((i) => i.url).sort()).toEqual(['/proyectos/moss', '/proyectos/moss-nexus', '/proyectos/portafolio'])
  })

  it('el tablero del Inicio no los cuenta', () => {
    expect(getGardenItems().some((i) => i.id.startsWith('project/'))).toBe(false)
  })

  it('las rutas existen en el router', () => {
    expect(appSource).toContain('path="proyectos"')
    expect(appSource).toContain('path="proyectos/:slug"')
  })
})

describe('estados de proyecto', () => {
  it('son los del ECOSISTEMA y cada uno tiene nombre en los dos idiomas', async () => {
    const { PROJECT_STATUSES } = await import('./content')
    const { statusLabels } = await import('./projects')
    expect([...PROJECT_STATUSES]).toEqual(['desarrollo', 'estable', 'mantenimiento', 'pausado'])
    for (const s of PROJECT_STATUSES) {
      expect(statusLabels.es[s], s).toBeTruthy()
      expect(statusLabels.en[s], s).toBeTruthy()
    }
  })
})
