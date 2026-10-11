import type { Heading } from '../../lib/content'
import { useLang } from '../../lib/i18n'

export default function Toc({ headings }: { headings: Heading[] }) {
  const en = useLang() === 'en'
  if (headings.length < 3) return null
  return (
    <nav aria-label={en ? 'Table of contents' : 'Tabla de contenido'} className="text-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{en ? 'On this page' : 'En esta página'}</p>
      <ul className="mt-2 border-l border-cream-deep" lang="es">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'pl-6' : 'pl-3'}>
            <a href={`#${h.id}`} className="inline-block py-1 text-ink-soft transition hover:text-sage-deep">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
