/**
 * Diagramas escritos dentro del Markdown, en bloques de código ```flow y ```mindmap.
 * Funciones puras: el componente Diagram decide cómo dibujarlos.
 *
 * flow — un paso por línea; "|" separa ramas paralelas del mismo paso:
 *   # Título opcional
 *   Webhook :: recibe el POST
 *   ? ¿Válido?
 *   + Responder 201 | ! Responder 400
 *
 * mindmap — la primera línea es el centro; "- " son ramas y "  - " sus hijos:
 *   Debounce y throttle
 *   - Debounce :: espera a que paren los eventos
 *     - Buscador
 *
 * En cualquier nodo, "::" separa el título del detalle, y los prefijos
 * "? ", "+ " y "! " lo marcan como decisión, resultado correcto o error.
 */

export type NodeKind = 'default' | 'decision' | 'success' | 'error'

export interface DiagramNode {
  title: string
  detail?: string
  kind: NodeKind
}

export interface FlowDiagram {
  type: 'flow'
  caption?: string
  /** Cada paso tiene uno o más nodos (ramas paralelas) */
  steps: DiagramNode[][]
}

export interface MindmapBranch extends DiagramNode {
  children: DiagramNode[]
}

export interface MindmapDiagram {
  type: 'mindmap'
  center: DiagramNode
  branches: MindmapBranch[]
}

export type Diagram = FlowDiagram | MindmapDiagram

const prefixes: Record<string, NodeKind> = { '?': 'decision', '+': 'success', '!': 'error' }

export function parseNode(text: string): DiagramNode {
  let raw = text.trim()
  let kind: NodeKind = 'default'
  const prefix = /^([?+!])\s+/.exec(raw)
  if (prefix) {
    kind = prefixes[prefix[1]]
    raw = raw.slice(prefix[0].length)
  }
  const sep = raw.indexOf('::')
  if (sep === -1) return { title: raw, kind }
  const detail = raw.slice(sep + 2).trim()
  return { title: raw.slice(0, sep).trim(), ...(detail && { detail }), kind }
}

const lines = (source: string) => source.split(/\r?\n/).filter((l) => l.trim() !== '')

export function parseFlow(source: string): FlowDiagram {
  let caption: string | undefined
  const steps: DiagramNode[][] = []
  for (const line of lines(source)) {
    const text = line.trim()
    if (text.startsWith('# ')) {
      caption = text.slice(2).trim()
      continue
    }
    const nodes = text.split('|').map(parseNode).filter((n) => n.title)
    if (nodes.length) steps.push(nodes)
  }
  return { type: 'flow', ...(caption && { caption }), steps }
}

export function parseMindmap(source: string): MindmapDiagram {
  let center: DiagramNode | undefined
  const branches: MindmapBranch[] = []
  for (const line of lines(source)) {
    const item = /^(\s*)-\s+(.*)$/.exec(line)
    if (!item) {
      // La primera línea que no es lista es el centro ("# " opcional)
      center ??= parseNode(line.trim().replace(/^#\s+/, ''))
      continue
    }
    const node = parseNode(item[2])
    // Con sangría (2 o más espacios) es hijo de la última rama
    if (item[1].length >= 2 && branches.length) branches[branches.length - 1].children.push(node)
    else branches.push({ ...node, children: [] })
  }
  return { type: 'mindmap', center: center ?? { title: '', kind: 'default' }, branches }
}

export const diagramLanguages = ['flow', 'mindmap'] as const
export type DiagramLanguage = (typeof diagramLanguages)[number]

export const isDiagramLanguage = (lang: string | undefined): lang is DiagramLanguage =>
  lang === 'flow' || lang === 'mindmap'

export const parseDiagram = (lang: DiagramLanguage, source: string): Diagram =>
  lang === 'flow' ? parseFlow(source) : parseMindmap(source)
