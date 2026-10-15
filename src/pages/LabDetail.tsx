import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import CodeBlock from '../components/code/CodeBlock'
import RouteNav from '../components/routes/RouteNav'
import SpanishNote from '../components/content/SpanishNote'
import { formatDate } from '../lib/format'
import { sectionNames, useLang, useT } from '../lib/i18n'
import { getLabEntry } from '../lib/lab'

const TEXT = {
  es: {
    notFound: 'No encontré esa entrada.',
    notFoundTitle: 'No encontrado',
    back: 'Volver al Laboratorio',
    preview: 'Vista previa',
    code: 'Código',
    usage: 'Cómo usarlo',
    deps: 'Dependencias:',
    created: (d: string) => `Creado el ${d}`,
  },
  en: {
    notFound: 'I couldn’t find that entry.',
    notFoundTitle: 'Not found',
    back: 'Back to the Lab',
    preview: 'Preview',
    code: 'Code',
    usage: 'How to use it',
    deps: 'Dependencies:',
    created: (d: string) => `Created on ${d}`,
  },
}
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function LabDetail() {
  const { slug = '' } = useParams()
  const entry = getLabEntry(slug)
  const lang = useLang()
  const t = useT(TEXT)
  useDocumentTitle(entry?.title ?? t.notFoundTitle)

  if (!entry) {
    return (
      <section>
        <p className="text-ink-soft">{t.notFound}</p>
        <Link to="/laboratorio" className="mt-3 inline-flex min-h-11 items-center text-sage-deep underline">
          {t.back}
        </Link>
      </section>
    )
  }

  return (
    <article>
      <Link to="/laboratorio" className="inline-flex min-h-8 items-center gap-1 text-sm text-ink-soft hover:text-sage-deep">
        <ArrowLeft size={14} aria-hidden /> {sectionNames[lang].lab}
      </Link>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight" lang="es">{entry.title}</h1>
      <p className="mt-2 max-w-xl text-ink-soft" lang="es">{entry.description}</p>
      <SpanishNote />

      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-full bg-lavender/50 px-2 py-0.5 text-lavender-deep">{entry.technology}</span>
        <span className="rounded-full bg-sage/30 px-2 py-0.5 text-sage-deep">{entry.category}</span>
        {entry.tags.map((t) => (
          <span key={t} className="rounded-full bg-surface/60 px-2 py-0.5 text-ink-soft">
            #{t}
          </span>
        ))}
      </div>

      <h2 className="mt-8 text-sm font-medium uppercase tracking-wide text-ink-soft">{t.preview}</h2>
      <div lang="es" className="mt-2 flex min-h-48 items-center justify-center rounded-2xl border border-surface/70 bg-cream-deep/60 p-8">
        <entry.Demo />
      </div>

      <h2 className="mt-8 text-sm font-medium uppercase tracking-wide text-ink-soft">{t.code}</h2>
      <div className="mt-2">
        <CodeBlock code={entry.source} />
      </div>

      <h2 className="mt-8 text-sm font-medium uppercase tracking-wide text-ink-soft">{t.usage}</h2>
      <p className="mt-2 text-ink-soft" lang="es">{entry.usage}</p>

      {entry.dependencies && (
        <p className="mt-4 text-sm text-ink-soft">
          {t.deps} {entry.dependencies.map((d) => (
            <code key={d} className="mr-1 rounded bg-surface/60 px-1.5 py-0.5 font-mono text-xs">{d}</code>
          ))}
        </p>
      )}

      <p className="mt-6 text-xs text-ink-soft">{t.created(formatDate(entry.createdAt, lang))}</p>

      <RouteNav id={`lab/${entry.slug}`} />
    </article>
  )
}
