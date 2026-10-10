import { Link } from 'react-router-dom'
import { journalPosts } from '../lib/content'
import { formatDate } from '../lib/format'

export default function Journal() {
  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">La Bitácora</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Aprendizajes, decisiones y errores: la evolución detrás del código.
      </p>

      {journalPosts.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">Todavía no hay artículos. 🌱</p>
      ) : (
        <ul className="mt-8 divide-y divide-cream-deep rounded-2xl border border-white/70 bg-white/50">
          {journalPosts.map((p) => (
            <li key={p.id}>
              <Link to={p.url} className="block px-6 py-5 transition hover:bg-sage/10">
                <p className="text-xs text-ink-soft">
                  {formatDate(p.createdAt)} · <span className="text-sage-deep">{p.category}</span> · {p.readingMinutes}{' '}
                  min
                </p>
                <h2 className="mt-1 text-lg font-medium">{p.title}</h2>
                <p className="mt-1 text-sm text-ink-soft">{p.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
