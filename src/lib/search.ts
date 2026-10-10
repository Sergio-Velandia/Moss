import MiniSearch from 'minisearch'
import { knowledgeItems, type KnowledgeItem } from './knowledge'

interface SearchDoc {
  id: string
  title: string
  description: string
  tags: string
  technologies: string
  body: string
}

// Palabras vacías en español: no aportan al buscar "animación de entrada"
const STOP_WORDS = new Set([
  'de', 'la', 'el', 'los', 'las', 'un', 'una', 'y', 'en', 'para', 'con', 'por', 'a', 'del', 'al', 'que', 'como', 'mi', 'se', 'es',
])

// Minúsculas y sin tildes, para que "animacion" encuentre "animación"
const normalize = (term: string) => term.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const processTerm = (term: string) => {
  const n = normalize(term)
  return STOP_WORDS.has(n) ? null : n
}

let index: MiniSearch<SearchDoc> | null = null

// El índice se construye una sola vez, la primera vez que se busca
function getIndex(): MiniSearch<SearchDoc> {
  if (index) return index
  index = new MiniSearch<SearchDoc>({
    fields: ['title', 'description', 'tags', 'technologies', 'body'],
    processTerm,
    searchOptions: {
      boost: { title: 3, tags: 2, technologies: 2, description: 1.5 },
      prefix: true,
      fuzzy: 0.2,
      processTerm,
    },
  })
  index.addAll(
    knowledgeItems.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      tags: i.tags.join(' '),
      technologies: i.technologies.join(' '),
      body: i.body,
    })),
  )
  return index
}

/** Busca en todo el jardín. Primero exige todas las palabras; si no hay resultados, acepta cualquiera. */
export function search(query: string): KnowledgeItem[] {
  const q = query.trim()
  if (!q) return []
  const idx = getIndex()
  let hits = idx.search(q, { combineWith: 'AND' })
  if (hits.length === 0) hits = idx.search(q, { combineWith: 'OR' })

  const byId = new Map(knowledgeItems.map((i) => [i.id, i]))
  return hits.map((h) => byId.get(h.id)).filter((i): i is KnowledgeItem => i !== undefined)
}
