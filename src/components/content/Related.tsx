import { Link } from 'react-router-dom'
import { resolveRelated, typeLabel } from '../../lib/knowledge'

export default function Related({ ids }: { ids: string[] }) {
  const items = resolveRelated(ids)
  if (items.length === 0) return null
  return (
    <aside className="mt-12" aria-labelledby="related-title">
      <h2 id="related-title" className="text-sm font-medium uppercase tracking-wide text-ink-soft">
        Relacionado
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((i) => (
          <li key={i.id}>
            <Link
              to={i.url}
              className="block rounded-2xl border border-surface/70 bg-surface/50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="rounded-full bg-lavender/50 px-2 py-0.5 text-xs text-lavender-deep">
                {typeLabel[i.type]}
              </span>
              <p className="mt-2 font-medium">{i.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{i.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
