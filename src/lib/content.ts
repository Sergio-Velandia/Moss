import GithubSlugger from 'github-slugger'
import { asString, asStringArray, parseFrontmatter } from './frontmatter'

export type DocType = 'manual' | 'journal' | 'project' | 'route'

export interface Heading {
  id: string
  text: string
  level: 2 | 3
}

/** Enlace a documentación oficial: en el frontmatter, `references: [Título | https://…, …]` */
export interface Reference {
  title: string
  url: string
}

/** Estados posibles de un proyecto documentado */
export const PROJECT_STATUSES = ['activo', 'mantenimiento', 'pausado'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

/** Identidad visual de la tarjeta y los botones del proyecto (clases .pt-* en index.css) */
export const PROJECT_THEMES = ['moss', 'nexus', 'portafolio'] as const
export type ProjectTheme = (typeof PROJECT_THEMES)[number]

/** Niveles de una ruta de aprendizaje */
export const ROUTE_LEVELS = ['inicial', 'intermedio', 'avanzado'] as const

/** Ruta de aprendizaje (content/routes/*.md): pasos en orden que apuntan a contenido existente */
export interface RouteFacts {
  level: string
  /** Ids en orden: manual/<cat>/<slug>, lab/<slug>, journal/<slug> o project/<slug> */
  steps: string[]
  /** Posición en el índice de rutas (menor primero) */
  order: number
  /** Cierra la ruta con la invitación a Moss Nexus */
  nexus: boolean
}

/** Secciones obligatorias de una página de proyecto, en este orden */
export const PROJECT_SECTIONS = ['Ficha', 'Arquitectura', 'Flujo de datos', 'Decisiones', 'Lecciones', 'Roadmap'] as const

/** Ficha de un proyecto (content/projects/*.md). Se valida con validateProject. */
export interface ProjectFacts {
  status: string
  /** Versión del proyecto que describe la página (semver) */
  version: string
  /** Última vez que se contrastó la página con el código (AAAA-MM-DD) */
  reviewedAt: string
  repo: string
  site: string
  /** Paleta con la que se muestra; sin indicar, la de Moss */
  theme: string
}

export interface Doc {
  /** Identificador único: manual/<categoría>/<slug>, journal/<slug> o project/<slug> */
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
  references: Reference[]
  body: string
  readingMinutes: number
  headings: Heading[]
  url: string
  /** Solo en los proyectos */
  project?: ProjectFacts
  /** Solo en las rutas */
  route?: RouteFacts
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

/** "Título | https://…" → { title, url }. Se descartan las entradas sin un enlace https válido. */
export function parseReferences(entries: string[]): Reference[] {
  return entries.flatMap((entry) => {
    const sep = entry.lastIndexOf('|')
    if (sep < 1) return []
    const title = entry.slice(0, sep).trim()
    const url = entry.slice(sep + 1).trim()
    try {
      return title && new URL(url).protocol === 'https:' ? [{ title, url }] : []
    } catch {
      return []
    }
  })
}

/** Nombre visible de cada carpeta del Manual: la carpeta sigue en la URL, el nombre es lo que se lee */
export const MANUAL_CATEGORY_NAMES: Record<string, string> = {
  apis: 'APIs',
  css: 'CSS',
  despliegue: 'Publicar y mantener',
  git: 'Git',
  javascript: 'JavaScript',
  n8n: 'n8n',
  react: 'React',
  sql: 'SQL',
}

export const manualCategoryName = (folder: string): string =>
  MANUAL_CATEGORY_NAMES[folder] ?? folder.charAt(0).toUpperCase() + folder.slice(1)

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
    category = manualCategoryName(parts[1])
    id = `manual/${parts[1]}/${slug}`
    url = `/manual/${parts[1]}/${slug}`
  } else if (root === 'journal' && parts.length === 2) {
    type = 'journal'
    category = asString(data.category, 'General')
    id = `journal/${slug}`
    url = `/bitacora/${slug}`
  } else if (root === 'routes' && parts.length === 2) {
    type = 'route'
    category = 'Ruta'
    id = `route/${slug}`
    url = `/rutas/${slug}`
  } else if (root === 'projects' && parts.length === 2) {
    type = 'project'
    category = 'Proyecto'
    id = `project/${slug}`
    url = `/proyectos/${slug}`
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
    references: parseReferences(asStringArray(data.references)),
    body,
    readingMinutes: Math.max(1, Math.round(words / 200)),
    headings: extractHeadings(body),
    url,
    ...(type === 'route' && {
      route: {
        level: asString(data.level),
        steps: asStringArray(data.steps),
        order: Number(asString(data.order, '99')) || 99,
        nexus: data.nexus === true,
      },
    }),
    ...(type === 'project' && {
      project: {
        status: asString(data.status),
        // `version: auto` usa la de este repositorio (solo tiene sentido en la ficha de Moss)
        version: data.version === 'auto' ? __APP_VERSION__ : asString(data.version),
        reviewedAt: asString(data.reviewedAt),
        repo: asString(data.repo),
        site: asString(data.site),
        theme: asString(data.theme, 'moss'),
      },
    }),
  }
}

const isHttps = (url: string) => {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

/** Cuerpo de una sección "## Título" hasta la siguiente sección de nivel 2 */
export function sectionBody(body: string, title: string): string {
  const lines = body.replace(/\r\n/g, '\n').split('\n')
  const start = lines.findIndex((l) => l.trim() === `## ${title}`)
  if (start === -1) return ''
  const end = lines.findIndex((l, i) => i > start && /^## /.test(l))
  return lines.slice(start + 1, end === -1 ? undefined : end).join('\n')
}

/** Una decisión se escribe como "- **Decisión:** … **En vez de:** … **Porque:** …" */
const DECISION = /^\s*[-*]\s+\*\*Decisión:\*\*.+\*\*En vez de:\*\*.+\*\*Porque:\*\*.+/
const DIAGRAM_FENCE = /^```(flow|mindmap)\s*$/m

/**
 * Reglas de una página de proyecto. Devuelve los problemas en español; lista vacía = válida.
 * Las pruebas exigen que todos los proyectos pasen, para que la información no caduque ni quede a medias.
 */
export function validateProject(doc: Doc): string[] {
  const errors: string[] = []
  const p = doc.project
  if (!p) return ['no es un proyecto']
  if (!(PROJECT_STATUSES as readonly string[]).includes(p.status)) errors.push(`status: uno de ${PROJECT_STATUSES.join(', ')}`)
  if (!/^\d+\.\d+\.\d+$/.test(p.version)) errors.push('version: obligatoria, con formato X.Y.Z')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.reviewedAt) || Number.isNaN(Date.parse(p.reviewedAt))) {
    errors.push('reviewedAt: obligatoria, con formato AAAA-MM-DD')
  }
  if (!isHttps(p.repo)) errors.push('repo: enlace https obligatorio')
  if (!isHttps(p.site)) errors.push('site: enlace https obligatorio')
  if (!(PROJECT_THEMES as readonly string[]).includes(p.theme)) errors.push(`theme: uno de ${PROJECT_THEMES.join(', ')}`)

  const sections = doc.headings.filter((h) => h.level === 2).map((h) => h.text)
  if (sections.join('|') !== PROJECT_SECTIONS.join('|')) {
    errors.push(`secciones: deben ser, en orden, ${PROJECT_SECTIONS.join(', ')} (hay: ${sections.join(', ')})`)
  }
  for (const title of ['Arquitectura', 'Flujo de datos']) {
    if (!DIAGRAM_FENCE.test(sectionBody(doc.body, title))) errors.push(`${title}: necesita un diagrama flow o mindmap`)
  }
  const decisions = sectionBody(doc.body, 'Decisiones').split('\n').filter((l) => DECISION.test(l)).length
  if (decisions < 4) errors.push(`Decisiones: mínimo 4 con el formato Decisión / En vez de / Porque (hay ${decisions})`)
  return errors
}

const allDocs: Doc[] = Object.entries(files)
  .map(([path, raw]) => parseDoc(path, raw))
  .filter((d): d is Doc => d !== null)
  // Los borradores solo se ven en desarrollo, nunca en la web publicada
  .filter((d) => !(d.draft && import.meta.env.PROD))
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

export const manualDocs = allDocs.filter((d) => d.type === 'manual')
export const journalPosts = allDocs.filter((d) => d.type === 'journal')
export const manualCategories = [...new Set(manualDocs.map((d) => d.category))].sort((a, b) => a.localeCompare(b, 'es'))
// Los proyectos se listan por nombre: su fecha de creación no dice nada de su importancia
export const projectDocs = allDocs
  .filter((d) => d.type === 'project')
  .sort((a, b) => a.title.localeCompare(b.title, 'es'))

/** Busca por la carpeta de la URL, no por el nombre visible de la categoría */
export const getManualDoc = (folder: string, slug: string) => manualDocs.find((d) => d.id === `manual/${folder}/${slug}`)
export const getJournalPost = (slug: string) => journalPosts.find((d) => d.slug === slug)
export const getProject = (slug: string) => projectDocs.find((d) => d.slug === slug)

export const routeDocs = allDocs
  .filter((d) => d.type === 'route')
  .sort((a, b) => (a.route?.order ?? 99) - (b.route?.order ?? 99) || a.title.localeCompare(b.title, 'es'))
export const getRoute = (slug: string) => routeDocs.find((d) => d.slug === slug)

/**
 * Reglas de una ruta. `existing` son los ids de todo el contenido publicado (knowledgeItems).
 * Una ruta debe tener al menos 4 pasos que existan, sin repetirse, y cruzar al menos dos secciones.
 */
export function validateRoute(doc: Doc, existing: Set<string>): string[] {
  const r = doc.route
  if (!r) return ['no es una ruta']
  const errors: string[] = []
  if (!(ROUTE_LEVELS as readonly string[]).includes(r.level)) errors.push(`level: uno de ${ROUTE_LEVELS.join(', ')}`)
  if (r.steps.length < 4) errors.push(`steps: mínimo 4 pasos (hay ${r.steps.length})`)
  if (new Set(r.steps).size !== r.steps.length) errors.push('steps: hay pasos repetidos')
  for (const step of r.steps) {
    if (step.startsWith('route/')) errors.push(`steps: una ruta no puede incluir otra ruta (${step})`)
    else if (!existing.has(step)) errors.push(`steps: "${step}" no existe`)
  }
  const sections = new Set(r.steps.map((s) => s.split('/')[0]))
  if (sections.size < 2) errors.push('steps: deben mezclar al menos dos secciones (por ejemplo, Manual y Laboratorio)')
  if (!doc.description) errors.push('description: obligatoria')
  return errors
}
