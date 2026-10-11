import { BookOpen, ExternalLink } from 'lucide-react'
import type { Reference } from '../../lib/content'
import { useLang, useT } from '../../lib/i18n'

const TEXT = {
  es: {
    title: 'Leer la documentación oficial',
    intro: 'La fuente primaria, por si algo cambió desde que escribí esta guía.',
    newTab: ' (se abre en una pestaña nueva)',
  },
  en: {
    title: 'Read the official docs',
    intro: 'The primary source, in case something changed since this guide was written.',
    newTab: ' (opens in a new tab)',
  },
}

const host = (url: string) => new URL(url).hostname.replace(/^www\./, '')

export default function OfficialDocs({ references }: { references: Reference[] }) {
  const t = useT(TEXT)
  const lang = useLang()
  if (references.length === 0) return null
  return (
    <aside aria-labelledby="official-docs" lang={lang} className="not-prose mt-10 rounded-2xl border border-sage/50 bg-sage/10 p-5">
      <h2 id="official-docs" className="flex items-center gap-2 font-medium">
        <BookOpen size={18} className="text-sage-deep" aria-hidden />
        {t.title}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">{t.intro}</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {references.map((r) => (
          <li key={r.url}>
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex h-full min-h-11 items-start gap-2 rounded-xl bg-surface/70 px-3 py-2.5 text-sm transition-colors hover:bg-surface"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-ink group-hover:text-sage-deep" lang="es">
                  {r.title}
                </span>
                <span className="block truncate text-xs text-ink-soft" translate="no">
                  {host(r.url)}
                </span>
              </span>
              <ExternalLink size={14} className="mt-1 shrink-0 text-ink-soft group-hover:text-sage-deep" aria-hidden />
              <span className="sr-only">{t.newTab}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
