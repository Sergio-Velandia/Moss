import { useSyncExternalStore } from 'react'

/**
 * Progreso de las rutas de aprendizaje, guardado solo en este navegador (localStorage, clave moss-route-progress).
 * Mismo patrón que el tema y el idioma: un estado fuera de React al que los componentes se suscriben.
 * Está descrito en la política de privacidad; no se envía a ningún servidor.
 */
export const PROGRESS_KEY = 'moss-route-progress'

/** Por ruta (slug), los ids de los pasos marcados como hechos */
export type Progress = Record<string, string[]>

const EMPTY: readonly string[] = Object.freeze([])
const listeners = new Set<() => void>()

/** Lee lo guardado sin confiar en ello: cualquier valor raro se descarta en lugar de romper la página */
export function parseProgress(raw: string | null): Progress {
  if (!raw) return {}
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return {}
    const out: Progress = {}
    for (const [slug, ids] of Object.entries(data)) {
      if (Array.isArray(ids)) out[slug] = ids.filter((x): x is string => typeof x === 'string')
    }
    return out
  } catch {
    return {}
  }
}

/** Marca o desmarca un paso; devuelve un objeto nuevo (no muta el anterior) */
export function toggleInProgress(progress: Progress, route: string, step: string): Progress {
  const done = progress[route] ?? []
  const next = done.includes(step) ? done.filter((s) => s !== step) : [...done, step]
  return { ...progress, [route]: next }
}

function load(): Progress {
  try {
    return parseProgress(localStorage.getItem(PROGRESS_KEY))
  } catch {
    return {}
  }
}

let state: Progress = typeof window === 'undefined' ? {} : load()

function save(next: Progress) {
  state = next
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next))
  } catch {
    /* almacenamiento bloqueado: el progreso solo dura esta visita */
  }
  listeners.forEach((l) => l())
}

export const toggleStep = (route: string, step: string) => save(toggleInProgress(state, route, step))

export function resetRoute(route: string) {
  const next = { ...state }
  delete next[route]
  save(next)
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

/** Pasos hechos de una ruta. Devuelve siempre la misma referencia mientras no cambie */
export function useRouteProgress(route: string): readonly string[] {
  return useSyncExternalStore(
    subscribe,
    () => state[route] ?? EMPTY,
    () => EMPTY,
  )
}
