import { useState } from 'react'
import { Link } from 'react-router-dom'
import { manualCategories, manualDocs } from '../lib/content'
import { formatDate } from '../lib/format'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const ALL = 'todas'

export default function Manual() {
  useDocumentTitle('El Manual')
  const [category, setCategory] = useState(ALL)
  const docs = manualDocs.filter((d) => category === ALL || d.category === category)

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">El Manual</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Documentación técnica, configuraciones y guías que cuesta reconstruir.
      </p>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Categoría">
        {[ALL, ...manualCategories].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`rounded-full px-3 py-1 pointer-coarse:py-2 text-xs capitalize transition ${
              category === c ? 'bg-accent text-on-accent' : 'bg-surface/60 text-ink-soft hover:bg-sage/20'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {docs.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">Aún no hay documentos en esta categoría. 🌱</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {docs.map((d) => (
            <li key={d.id}>
              <Link
                to={d.url}
                className="flex h-full flex-col rounded-2xl border border-surface/70 bg-surface/50 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="w-fit rounded-full bg-sage/30 px-2 py-0.5 text-xs capitalize text-sage-deep">
                  {d.category}
                </span>
                <h2 className="mt-3 font-medium">{d.title}</h2>
                <p className="mt-1 flex-1 text-sm text-ink-soft">{d.description}</p>
                <p className="mt-3 text-xs text-ink-soft">
                  Actualizado el {formatDate(d.updatedAt ?? d.createdAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
