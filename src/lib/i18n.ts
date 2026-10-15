import { useSyncExternalStore } from 'react'

/**
 * Idioma de la interfaz. Igual que el tema: vive fuera de React y los componentes se suscriben.
 * El contenido (Markdown y demos) está escrito en español; lo que se traduce es la interfaz.
 */
export type Lang = 'es' | 'en'

const KEY = 'moss-lang'
const listeners = new Set<() => void>()

const descriptions: Record<Lang, string> = {
  es: 'Moss — Digital Garden: mi biblioteca personal de componentes, documentación y aprendizajes técnicos.',
  en: 'Moss — Digital Garden: my personal library of components, documentation and technical learnings.',
}

const isLang = (v: unknown): v is Lang => v === 'es' || v === 'en'

/** Orden: ?lang= en la URL (enlace compartido), elección guardada y, por defecto, español. */
function initialLang(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang')
    if (isLang(fromUrl)) return fromUrl
  } catch {
    /* sin URL accesible */
  }
  try {
    const stored = localStorage.getItem(KEY)
    if (isLang(stored)) return stored
  } catch {
    /* almacenamiento bloqueado */
  }
  return 'es'
}

function apply(lang: Lang) {
  document.documentElement.lang = lang
  document.querySelector('meta[name="description"]')?.setAttribute('content', descriptions[lang])
}

let current: Lang = typeof window === 'undefined' ? 'es' : initialLang()
if (typeof document !== 'undefined') apply(current)

export const getLang = (): Lang => current

export function setLang(lang: Lang) {
  if (lang === current) return
  current = lang
  apply(lang)
  try {
    localStorage.setItem(KEY, lang)
  } catch {
    /* el idioma solo dura la sesión */
  }
  // Si la página se abrió con ?lang=, lo actualizamos para que recargar o compartir no lo contradiga
  const url = new URL(window.location.href)
  if (url.searchParams.has('lang')) {
    url.searchParams.set('lang', lang)
    window.history.replaceState(window.history.state, '', url)
  }
  listeners.forEach((l) => l())
}

export function subscribeLang(callback: () => void) {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

export const useLang = (): Lang => useSyncExternalStore(subscribeLang, getLang, () => 'es' as const)

/** Devuelve los textos del idioma actual: `const t = useT(TEXT)` con `TEXT = { es: {...}, en: {...} }`. */
export function useT<T>(text: Record<Lang, T>): T {
  return text[useLang()]
}

/** Nombres de las secciones, compartidos por la navegación, el Herbario y el tablero. */
export const sectionNames: Record<
  Lang,
  { lab: string; manual: string; journal: string; herbario: string; project: string; route: string }
> = {
  es: { lab: 'Laboratorio', manual: 'Manual', journal: 'Bitácora', herbario: 'Herbario', project: 'Proyectos', route: 'Rutas' },
  en: { lab: 'Lab', manual: 'Manual', journal: 'Journal', herbario: 'Herbarium', project: 'Projects', route: 'Routes' },
}

/** Aviso para el contenido escrito en español cuando la interfaz está en inglés. */
export const spanishContentNote = 'This content is written in Spanish.'
