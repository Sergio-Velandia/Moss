export type Theme = 'light' | 'dark'

const KEY = 'moss-theme'
const listeners = new Set<() => void>()

/** El tema vive en <html data-theme="...">; index.html lo fija antes de pintar. */
export const getTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

export function setTheme(theme: Theme, persist = true) {
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#141a13' : '#faf7ef')
  if (persist) {
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* almacenamiento bloqueado: el tema solo dura la sesión */
    }
  }
  listeners.forEach((l) => l())
}

export function subscribeTheme(callback: () => void) {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

/** Mientras la persona no haya elegido un tema a mano, seguimos el del sistema. */
export function followSystemTheme() {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', (e) => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(KEY)
    } catch {
      /* ignorar */
    }
    if (stored !== 'light' && stored !== 'dark') setTheme(e.matches ? 'dark' : 'light', false)
  })
}
