import { useState } from 'react'
import { Link } from 'react-router-dom'
import { manualCategories, manualDocs } from '../lib/content'
import { formatDate } from '../lib/format'
import { useLang, useT } from '../lib/i18n'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const ALL = ''

const TEXT = {
  es: {
    title: 'El Manual',
    intro: 'Documentación técnica, configuraciones y guías que cuesta reconstruir.',
    category: 'Categoría',
    all: 'Todas',
    empty: 'Aún no hay documentos en esta categoría. 🌱',
    updated: (d: string) => `Actualizado el ${d}`,
  },
  en: {
    title: 'The Manual',
    intro: 'Technical documentation, configurations and guides that are hard to rebuild.',
    category: 'Category',
    all: 'All',
    empty: 'There are no documents in this category yet. 🌱',
    updated: (d: string) => `Updated on ${d}`,
  },
}

export default function Manual() {
  const lang = useLang()
  const t = useT(TEXT)
  useDocumentTitle(t.title)
  const [category, setCategory] = useState(ALL)
  const docs = manualDocs.filter((d) => category === ALL || d.category === category)

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-3 max-w-xl text-ink-soft">{t.intro}</p>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={t.category}>
        {[ALL, ...manualCategories].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`rounded-full px-3 py-1 pointer-coarse:py-2 text-xs transition ${
              category === c ? 'bg-accent text-on-accent' : 'bg-surface/60 text-ink-soft hover:bg-sage/20'
            }`}
          >
            {c === ALL ? t.all : c}
          </button>
        ))}
      </div>

      {docs.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">{t.empty}</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {docs.map((d) => (
            <li key={d.id}>
              <Link
                to={d.url}
                className="flex h-full flex-col rounded-2xl border border-surface/70 bg-surface/50 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="w-fit rounded-full bg-sage/30 px-2 py-0.5 text-xs text-sage-deep">
                  {d.category}
                </span>
                <h2 className="mt-3 font-medium" lang="es">{d.title}</h2>
                <p className="mt-1 flex-1 text-sm text-ink-soft" lang="es">{d.description}</p>
                <p className="mt-3 text-xs text-ink-soft">
                  {t.updated(formatDate(d.updatedAt ?? d.createdAt, lang))}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
