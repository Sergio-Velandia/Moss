import type { Heading } from '../../lib/content'

export default function Toc({ headings }: { headings: Heading[] }) {
  if (headings.length < 3) return null
  return (
    <nav aria-label="Tabla de contenido" className="text-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">En esta página</p>
      <ul className="mt-2 space-y-1.5 border-l border-cream-deep">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'pl-6' : 'pl-3'}>
            <a href={`#${h.id}`} className="text-ink-soft transition hover:text-sage-deep">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
