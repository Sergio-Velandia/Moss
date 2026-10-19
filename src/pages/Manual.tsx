import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Route as RouteIcon } from 'lucide-react'
import { manualCategories, manualDocs } from '../lib/content'
import { formatDate } from '../lib/format'
import { useLang, useT } from '../lib/i18n'
import { routesContaining } from '../lib/routes'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const ALL = ''

const TEXT = {
  es: {
    title: 'El Manual',
    intro: 'Documentación técnica, configuraciones y guías que cuesta reconstruir.',
    start: '¿No sabes por dónde empezar? Las rutas ordenan estas guías de principio a fin.',
    startLink: 'Ver las rutas',
    category: 'Categoría',
    all: 'Todas',
    empty: 'Aún no hay documentos en esta categoría. 🌱',
    count: (n: number) => (n === 1 ? '1 guía' : `${n} guías`),
    minutes: (n: number) => `${n} min`,
    inRoute: (title: string) => `Ruta: ${title}`,
    updated: (d: string) => `Actualizado el ${d}`,
  },
  en: {
    title: 'The Manual',
    intro: 'Technical documentation, configurations and guides that are hard to rebuild.',
    start: 'Not sure where to start? Routes put these guides in order, end to end.',
    startLink: 'See the routes',
    category: 'Category',
    all: 'All',
    empty: 'There are no documents in this category yet. 🌱',
    count: (n: number) => (n === 1 ? '1 guide' : `${n} guides`),
    minutes: (n: number) => `${n} min`,
    inRoute: (title: string) => `Route: ${title}`,
    updated: (d: string) => `Updated on ${d}`,
  },
}

export default function Manual() {
  const lang = useLang()
  const t = useT(TEXT)
  useDocumentTitle(t.title)
  const [category, setCategory] = useState(ALL)
  // Agrupado por categoría: así las guías de un tema quedan juntas aunque se hayan escrito en días distintos
  const groups = manualCategories
    .filter((c) => category === ALL || c === category)
    .map((c) => ({ category: c, docs: manualDocs.filter((d) => d.category === c) }))
    .filter((g) => g.docs.length > 0)

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-3 max-w-xl text-ink-soft">{t.intro}</p>
      <p className="mt-2 max-w-xl text-sm text-ink-soft">
        {t.start}{' '}
        <Link to="/rutas" className="inline-flex min-h-11 items-center font-medium text-sage-deep underline underline-offset-4 hover:no-underline">
          {t.startLink} →
        </Link>
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t.category}>
        {[ALL, ...manualCategories].map((c) => (
          <button
            key={c}
            type="button"
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

      {groups.length === 0 && <p className="mt-10 text-sm text-ink-soft">{t.empty}</p>}

      {groups.map((g) => {
        const headingId = `manual-${g.docs[0].id.split('/')[1]}`
        return (
          <section key={g.category} aria-labelledby={headingId} className="mt-10">
            <h2 id={headingId} className="flex items-baseline gap-2 text-lg font-semibold tracking-tight">
              {g.category}
              <span className="text-sm font-normal text-ink-soft">{t.count(g.docs.length)}</span>
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {g.docs.map((d) => {
                const route = routesContaining(d.id)[0]?.route
                const updated = d.updatedAt && d.updatedAt !== d.createdAt ? d.updatedAt : undefined
                return (
                  <li key={d.id}>
                    <Link
                      to={d.url}
                      className="flex h-full flex-col rounded-2xl border border-surface/70 bg-surface/50 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <h3 className="font-medium" lang="es">{d.title}</h3>
                      <p className="mt-1 flex-1 text-sm text-ink-soft" lang="es">{d.description}</p>
                      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-soft">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} aria-hidden /> {t.minutes(d.readingMinutes)}
                        </span>
                        {route && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-lavender/50 px-2 py-0.5 text-lavender-deep" lang="es">
                            <RouteIcon size={12} aria-hidden /> {t.inRoute(route.title)}
                          </span>
                        )}
                        {updated && <span>{t.updated(formatDate(updated, lang))}</span>}
                      </p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </section>
  )
}
