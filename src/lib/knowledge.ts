import { journalPosts, manualDocs } from './content'
import { labEntries } from './lab'

export type ItemType = 'lab' | 'manual' | 'journal'

/** Vista unificada de todo el jardín: sirve para la búsqueda, el inicio y los enlaces relacionados. */
export interface KnowledgeItem {
  id: string
  type: ItemType
  title: string
  description: string
  tags: string[]
  technologies: string[]
  category: string
  createdAt: string
  url: string
  /** Texto completo indexable (contenido del documento o código de la demo) */
  body: string
}

export const knowledgeItems: KnowledgeItem[] = [
  ...labEntries.map<KnowledgeItem>((e) => ({
    id: `lab/${e.slug}`,
    type: 'lab',
    title: e.title,
    description: e.description,
    tags: e.tags,
    technologies: [e.technology],
    category: e.category,
    createdAt: e.createdAt,
    url: `/laboratorio/${e.slug}`,
    body: `${e.usage}\n${e.source}`,
  })),
  ...[...manualDocs, ...journalPosts].map<KnowledgeItem>((d) => ({
    id: d.id,
    type: d.type as 'manual' | 'journal',
    title: d.title,
    description: d.description,
    tags: d.tags,
    technologies: d.technologies,
    category: d.category,
    createdAt: d.createdAt,
    url: d.url,
    body: d.body,
  })),
].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

export const resolveRelated = (ids: string[]): KnowledgeItem[] =>
  ids
    .map((id) => knowledgeItems.find((i) => i.id === id))
    .filter((i): i is KnowledgeItem => i !== undefined)
