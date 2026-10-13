import { journalPosts, manualDocs } from './content'
import type { Lang } from './i18n'
import { labEntries } from './lab'

/**
 * Datos del tablero del Inicio. Solo funciones puras: la UI (MossDashboard) decide cómo pintarlos.
 */

export type GardenType = 'laboratorio' | 'manual' | 'bitacora'

export interface GardenItem {
  id: string
  title: string
  /** Fecha ISO (YYYY-MM-DD) */
  createdAt: string
  type: GardenType
  technologies: string[]
}

export const gardenTypes: GardenType[] = ['laboratorio', 'manual', 'bitacora']

export const gardenTypeLabel: Record<GardenType, string> = {
  laboratorio: 'Laboratorio',
  manual: 'Manual',
  bitacora: 'Bitácora',
}

/**
 * Todo el conocimiento publicado. Los borradores ya los filtra content.ts, igual que en el resto del sitio.
 * Los proyectos no cuentan a propósito: el tablero mide lo plantado (demos, guías y artículos), y las fichas
 * de proyecto describen repositorios; sumarlas inflaría el radar de tecnologías y el ritmo de crecimiento.
 */
export function getGardenItems(): GardenItem[] {
  return [
    ...labEntries.map<GardenItem>((e) => ({
      id: `lab/${e.slug}`,
      title: e.title,
      createdAt: e.createdAt,
      type: 'laboratorio',
      technologies: [e.technology],
    })),
    ...[...manualDocs, ...journalPosts].map<GardenItem>((d) => ({
      id: d.id,
      title: d.title,
      createdAt: d.createdAt,
      type: d.type === 'manual' ? 'manual' : 'bitacora',
      technologies: d.technologies,
    })),
  ]
}

// ——— Datos de ejemplo ———

/** Por debajo de este número de elementos reales, el tablero muestra datos de ejemplo. */
export const MIN_REAL_ITEMS = 10

// [meses atrás, día, tipo, título, tecnologías]. Hay meses con mucha actividad, otros flojos y uno vacío.
const mockSeed: [number, number, GardenType, string, string[]][] = [
  [7, 4, 'manual', 'Configurar Vite desde cero', ['Vite', 'TypeScript']],
  [7, 19, 'laboratorio', 'Botón con ripple', ['React', 'CSS']],
  [6, 2, 'bitacora', 'Por qué empecé un jardín digital', ['Markdown']],
  [6, 9, 'manual', 'Ramas y rebase sin miedo', ['Git']],
  [6, 15, 'laboratorio', 'Tarjeta con hover suave', ['CSS']],
  [6, 27, 'manual', 'Joins explicados con ejemplos', ['SQL']],
  [5, 3, 'laboratorio', 'Modal accesible', ['React', 'TypeScript']],
  [5, 8, 'manual', 'Índices en PostgreSQL', ['SQL']],
  [5, 14, 'manual', 'Autenticación con tokens en una API', ['APIs', 'TypeScript']],
  [5, 21, 'bitacora', 'Lo que aprendí migrando a TypeScript', ['TypeScript', 'React']],
  [5, 28, 'laboratorio', 'Grid responsive sin media queries', ['CSS']],
  [4, 17, 'manual', 'Mensajes de commit útiles', ['Git']],
  [2, 1, 'manual', 'Primer flujo en n8n', ['n8n', 'APIs']],
  [2, 6, 'laboratorio', 'Hook useDebounce', ['React', 'TypeScript']],
  [2, 11, 'manual', 'Reintentos en peticiones HTTP', ['APIs', 'TypeScript']],
  [2, 16, 'bitacora', 'Un mes sin escribir', ['Markdown']],
  [2, 22, 'manual', 'Ventanas con OVER en SQL', ['SQL']],
  [2, 28, 'laboratorio', 'Toast con cola de mensajes', ['React', 'CSS']],
  [1, 5, 'manual', 'Credenciales en n8n', ['n8n']],
  [1, 13, 'laboratorio', 'Tabs con teclado', ['React']],
  [1, 24, 'bitacora', 'Automatizar sin perder el control', ['n8n']],
  [0, 1, 'manual', 'Webhooks seguros en n8n', ['n8n', 'APIs']],
  [0, 3, 'laboratorio', 'Skeleton con shimmer', ['CSS']],
  [0, 7, 'manual', 'Hooks de Git para lint', ['Git', 'TypeScript']],
  [0, 12, 'laboratorio', 'Formulario con validación', ['React', 'TypeScript']],
  [0, 18, 'bitacora', 'Ordenar el jardín', ['Markdown', 'React']],
]

const pad = (n: number) => String(n).padStart(2, '0')

/** Genera el ejemplo relativo a `now`, para que siempre termine en el mes actual. */
export function createMockItems(now = new Date()): GardenItem[] {
  const currentKey = now.getFullYear() * 12 + now.getMonth()
  return mockSeed.map(([monthsAgo, day, type, title, technologies], i) => {
    const key = currentKey - monthsAgo
    // En el mes actual no plantamos nada en el futuro
    const d = monthsAgo === 0 ? Math.min(day, now.getDate()) : day
    return {
      id: `mock/${i}`,
      title,
      createdAt: `${Math.floor(key / 12)}-${pad((key % 12) + 1)}-${pad(d)}`,
      type,
      technologies,
    }
  })
}

export const MOCK_ITEMS: GardenItem[] = createMockItems()

/** Devuelve el contenido real, o el de ejemplo si todavía es muy poco. */
export function selectItems(real: GardenItem[], mock: GardenItem[] = MOCK_ITEMS) {
  return real.length < MIN_REAL_ITEMS ? { items: mock, isMock: true } : { items: real, isMock: false }
}

// ——— Fechas ———

/**
 * "2026-10-01" → índice de mes (año * 12 + mes). Sin `new Date(string)`:
 * esa ruta interpreta la fecha en UTC y en América un día 1 puede caer en el mes anterior.
 */
export function monthKey(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  const month = Number(m[2])
  if (month < 1 || month > 12) return null
  return Number(m[1]) * 12 + month - 1
}

// Listas propias en vez de Intl: según la versión de ICU, "es" abrevia septiembre como "sep" o "sept"
const monthShort: Record<Lang, string[]> = {
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}
const monthLong: Record<Lang, string[]> = {
  es: [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
}

// ——— Agregaciones ———

/** Nombres canónicos de tecnologías. La clave va en minúsculas; añade aquí los alias nuevos. */
const technologyAliases: Record<string, string> = {
  react: 'React',
  'react.js': 'React',
  reactjs: 'React',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  javascript: 'JavaScript',
  js: 'JavaScript',
  css: 'CSS',
  css3: 'CSS',
  html: 'HTML',
  html5: 'HTML',
  sql: 'SQL',
  api: 'APIs',
  apis: 'APIs',
  git: 'Git',
  n8n: 'n8n',
  node: 'Node.js',
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  markdown: 'Markdown',
  md: 'Markdown',
  vite: 'Vite',
  docker: 'Docker',
}

export interface TechnologyStat {
  technology: string
  /** Elementos que mencionan la tecnología */
  count: number
  /** count normalizado: 100 = la tecnología más frecuente */
  value: number
}

/** Las tecnologías más documentadas. Cada elemento cuenta una vez por tecnología, aunque la repita. */
export function byTechnology(items: readonly GardenItem[], limit = 7): TechnologyStat[] {
  const counts = new Map<string, { technology: string; count: number }>()

  for (const item of items) {
    const seen = new Set<string>()
    for (const raw of item.technologies) {
      const name = raw.trim()
      if (!name) continue
      // Sin alias conocido, se muestra como apareció la primera vez
      const technology = technologyAliases[name.toLowerCase()] ?? name
      const key = technology.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      const entry = counts.get(key)
      if (entry) entry.count++
      else counts.set(key, { technology, count: 1 })
    }
  }

  const top = [...counts.values()]
    .sort((a, b) => b.count - a.count || a.technology.localeCompare(b.technology, 'es'))
    .slice(0, limit)
  const max = top[0]?.count ?? 0
  return top.map((t) => ({ ...t, value: Math.round((t.count / max) * 100) }))
}

export interface MonthStat {
  /** YYYY-MM */
  key: string
  /** "oct" (en inglés, "Oct") */
  label: string
  /** "octubre de 2026" (en inglés, "October 2026") */
  fullLabel: string
  count: number
  isCurrent: boolean
}

/**
 * Elementos plantados por mes, desde el primero hasta el actual (como mucho los últimos `maxMonths`).
 * Los meses sin contenido aparecen con 0: así la constancia se ve tal como es.
 */
export function byMonth(items: readonly GardenItem[], now = new Date(), maxMonths = 12, lang: Lang = 'es'): MonthStat[] {
  const currentKey = now.getFullYear() * 12 + now.getMonth()
  const counts = new Map<number, number>()
  let first = Infinity

  for (const item of items) {
    const key = monthKey(item.createdAt)
    // Fechas inválidas o futuras no cuentan
    if (key === null || key > currentKey) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
    if (key < first) first = key
  }
  if (first === Infinity) return []

  const start = Math.max(first, currentKey - maxMonths + 1)
  const months: MonthStat[] = []
  for (let key = start; key <= currentKey; key++) {
    const year = Math.floor(key / 12)
    const month = key % 12
    months.push({
      key: `${year}-${pad(month + 1)}`,
      label: monthShort[lang][month],
      fullLabel: lang === 'es' ? `${monthLong.es[month]} de ${year}` : `${monthLong.en[month]} ${year}`,
      count: counts.get(key) ?? 0,
      isCurrent: key === currentKey,
    })
  }
  return months
}

export interface TypeStat {
  type: GardenType
  label: string
  count: number
  /** Porcentaje entero; los tres suman 100 (si hay elementos) */
  percent: number
}

/** Reparto entre Laboratorio, Manual y Bitácora. */
export function byType(items: readonly GardenItem[]): TypeStat[] {
  const counts: Record<GardenType, number> = { laboratorio: 0, manual: 0, bitacora: 0 }
  for (const item of items) counts[item.type]++

  const total = items.length
  const stats = gardenTypes.map((type) => {
    const exact = total ? (counts[type] / total) * 100 : 0
    return { type, label: gardenTypeLabel[type], count: counts[type], percent: Math.floor(exact), rest: exact % 1 }
  })

  // Método del resto mayor: repartimos los puntos que faltan para que la suma sea exactamente 100
  let missing = total ? 100 - stats.reduce((sum, s) => sum + s.percent, 0) : 0
  for (const s of [...stats].sort((a, b) => b.rest - a.rest)) {
    if (missing-- <= 0) break
    s.percent++
  }
  return stats.map(({ type, label, count, percent }) => ({ type, label, count, percent }))
}
