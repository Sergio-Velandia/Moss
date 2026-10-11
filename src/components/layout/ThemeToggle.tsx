import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useT } from '../../lib/i18n'
import { getTheme, setTheme, subscribeTheme } from '../../lib/theme'

const TEXT = {
  es: { toDark: 'Cambiar a tema oscuro', toLight: 'Cambiar a tema claro', dark: 'Tema oscuro', light: 'Tema claro' },
  en: { toDark: 'Switch to dark theme', toLight: 'Switch to light theme', dark: 'Dark theme', light: 'Light theme' },
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => 'light' as const)
  const next = theme === 'dark' ? 'light' : 'dark'
  const t = useT(TEXT)

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={next === 'dark' ? t.toDark : t.toLight}
      title={next === 'dark' ? t.dark : t.light}
      className="inline-flex h-9 w-9 pointer-coarse:h-11 pointer-coarse:w-11 items-center justify-center rounded-xl text-ink-soft transition hover:bg-sage/20 hover:text-ink active:scale-95"
    >
      {theme === 'dark' ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  )
}
