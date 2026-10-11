import { Link } from 'react-router-dom'
import { journalPosts } from '../lib/content'
import { formatDate } from '../lib/format'
import { useLang, useT } from '../lib/i18n'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const TEXT = {
  es: {
    title: 'La Bitácora',
    intro: 'Aprendizajes, decisiones y errores: la evolución detrás del código.',
    empty: 'Todavía no hay artículos. 🌱',
  },
  en: {
    title: 'The Journal',
    intro: 'Learnings, decisions and mistakes: the story behind the code.',
    empty: 'There are no articles yet. 🌱',
  },
}

export default function Journal() {
  const lang = useLang()
  const t = useT(TEXT)
  useDocumentTitle(t.title)
  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-3 max-w-xl text-ink-soft">{t.intro}</p>

      {journalPosts.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">{t.empty}</p>
      ) : (
        <ul className="mt-8 divide-y divide-cream-deep rounded-2xl border border-surface/70 bg-surface/50">
          {journalPosts.map((p) => (
            <li key={p.id}>
              <Link to={p.url} className="block px-6 py-5 transition hover:bg-sage/10">
                <p className="text-xs text-ink-soft">
                  {formatDate(p.createdAt, lang)} · <span className="text-sage-deep" lang="es">{p.category}</span> · {p.readingMinutes}{' '}
                  min
                </p>
                <h2 className="mt-1 text-lg font-medium" lang="es">{p.title}</h2>
                <p className="mt-1 text-sm text-ink-soft" lang="es">{p.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
