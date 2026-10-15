import { journalPosts, manualDocs, projectDocs, routeDocs, type Doc } from './content'
import { knowledgeItems, type KnowledgeItem } from './knowledge'

/** Minutos que se estiman para una demo o reto del Laboratorio (los documentos usan su tiempo de lectura) */
export const LAB_MINUTES = 5

export interface RouteStep {
  id: string
  item: KnowledgeItem
  minutes: number
}

const byId = new Map(knowledgeItems.map((i) => [i.id, i]))
const readingMinutes = new Map([...manualDocs, ...journalPosts, ...projectDocs].map((d) => [d.id, d.readingMinutes]))

export const stepMinutes = (id: string) => readingMinutes.get(id) ?? LAB_MINUTES

/** Los pasos de una ruta con su contenido; un id que no existe se omite (y las pruebas fallan) */
export function routeSteps(route: Doc): RouteStep[] {
  return (route.route?.steps ?? []).flatMap((id) => {
    const item = byId.get(id)
    return item ? [{ id, item, minutes: stepMinutes(id) }] : []
  })
}

export const routeMinutes = (route: Doc) => routeSteps(route).reduce((sum, s) => sum + s.minutes, 0)

export interface RoutePosition {
  route: Doc
  /** Posición del paso, empezando en 0 */
  index: number
  total: number
  previous?: KnowledgeItem
  next?: KnowledgeItem
}

/** En qué rutas aparece una pieza de contenido, y qué viene antes y después en cada una */
export function routesContaining(id: string, routes: Doc[] = routeDocs): RoutePosition[] {
  return routes.flatMap((route) => {
    const steps = routeSteps(route)
    const index = steps.findIndex((s) => s.id === id)
    if (index === -1) return []
    return [{ route, index, total: steps.length, previous: steps[index - 1]?.item, next: steps[index + 1]?.item }]
  })
}

/** El primer paso sin hacer, o el primero si ya están todos hechos */
export function nextPending(stepIds: string[], done: readonly string[]): string | undefined {
  return stepIds.find((id) => !done.includes(id)) ?? stepIds[0]
}
