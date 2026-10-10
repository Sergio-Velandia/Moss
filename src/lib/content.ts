import GithubSlugger from 'github-slugger'
import { asString, asStringArray, parseFrontmatter } from './frontmatter'

export type DocType = 'manual' | 'journal'

export interface Heading {
  id: string
  text: string
  level: 2 | 3
}

export interface Doc {
  /** Identificador único: manual/<categoría>/<slug> o journal/<slug> */
  id: string
  type: DocType
  slug: string
  category: string
  title: string
  description: string
  tags: string[]
  technologies: string[]
  createdAt: string
  updatedAt?: string
  draft: boolean
  /** Ids de contenido relacionado: lab/<slug>, manual/<cat>/<slug>, journal/<slug> */
  related: string[]
  body: string
  readingMinutes: number
  headings: Heading[]
  url: string
}

// Todo el contenido editorial vive en /content como archivos Markdown.
const files = import.meta.glob('/content/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function extractHeadings(body: string): Heading[] {
  const slugger = new GithubSlugger()
  const headings: Heading[] = []
  let inFence = false

  for (const line of body.split('\n')) {
    if (line.trimStart().startsWith('```')) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const m = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line)
    if (!m) continue
    // Quitamos el formato inline para que el id coincida con el que genera rehype-slug
    const text = m[2].replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[`*_]/g, '')
    headings.push({ id: slugger.slug(text), text, level: m[1].length as 2 | 3 })
  }
  return headings
}

function parseDoc(path: string, raw: string): Doc | null {
  // /content/manual/react/estructura.md → ['manual', 'react', 'estructura.md']
  const parts = path.replace(/^\/content\//, '').split('/')
  const root = parts[0]
  const slug = parts[parts.length - 1].replace(/\.md$/, '')
  const { data, body } = parseFrontmatter(raw)

  let type: DocType
  let category: string
  let id: string
  let url: string

  if (root === 'manual' && parts.length === 3) {
    type = 'manual'
    category = parts[1]
    id = `manual/${category}/${slug}`
    url = `/manual/${category}/${slug}`
  } else if (root === 'journal' && parts.length === 2) {
    type = 'journal'
    category = asString(data.category, 'General')
    id = `journal/${slug}`
    url = `/bitacora/${slug}`
  } else {
    return null
  }

  const words = body.split(/\s+/).filter(Boolean).length

  return {
    id,
    type,
    slug,
    category,
    title: asString(data.title, slug),
    description: asString(data.description),
    tags: asStringArray(data.tags),
    technologies: asStringArray(data.technologies),
    createdAt: asString(data.createdAt, '1970-01-01'),
    updatedAt: asString(data.updatedAt) || undefined,
    draft: data.draft === true,
    related: asStringArray(data.related),
    body,
    readingMinutes: Math.max(1, Math.round(words / 200)),
    headings: extractHeadings(body),
    url,
  }
}

const allDocs: Doc[] = Object.entries(files)
  .map(([path, raw]) => parseDoc(path, raw))
  .filter((d): d is Doc => d !== null)
  // Los borradores solo se ven en desarrollo, nunca en la web publicada
  .filter((d) => !(d.draft && import.meta.env.PROD))
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

export const manualDocs = allDocs.filter((d) => d.type === 'manual')
export const journalPosts = allDocs.filter((d) => d.type === 'journal')
export const manualCategories = [...new Set(manualDocs.map((d) => d.category))].sort()

export const getManualDoc = (category: string, slug: string) =>
  manualDocs.find((d) => d.category === category && d.slug === slug)
export const getJournalPost = (slug: string) => journalPosts.find((d) => d.slug === slug)
