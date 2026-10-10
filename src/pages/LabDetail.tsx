import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import CodeBlock from '../components/code/CodeBlock'
import { getLabEntry } from '../lib/lab'

export default function LabDetail() {
  const { slug = '' } = useParams()
  const entry = getLabEntry(slug)

  if (!entry) {
    return (
      <section>
        <p className="text-ink-soft">No encontré esa entrada.</p>
        <Link to="/laboratorio" className="mt-3 inline-block text-sage-deep underline">
          Volver al Laboratorio
        </Link>
      </section>
    )
  }

  return (
    <article>
      <Link to="/laboratorio" className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-sage-deep">
        <ArrowLeft size={14} aria-hidden /> Laboratorio
      </Link>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{entry.title}</h1>
      <p className="mt-2 max-w-xl text-ink-soft">{entry.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-full bg-lavender/50 px-2 py-0.5 text-lavender-deep">{entry.technology}</span>
        <span className="rounded-full bg-sage/30 px-2 py-0.5 text-sage-deep">{entry.category}</span>
        {entry.tags.map((t) => (
          <span key={t} className="rounded-full bg-white/60 px-2 py-0.5 text-ink-soft">
            #{t}
          </span>
        ))}
      </div>

      <h2 className="mt-8 text-sm font-medium uppercase tracking-wide text-ink-soft">Vista previa</h2>
      <div className="mt-2 flex min-h-48 items-center justify-center rounded-2xl border border-white/70 bg-cream-deep/60 p-8">
        <entry.Demo />
      </div>

      <h2 className="mt-8 text-sm font-medium uppercase tracking-wide text-ink-soft">Código</h2>
      <div className="mt-2">
        <CodeBlock code={entry.source} />
      </div>

      <h2 className="mt-8 text-sm font-medium uppercase tracking-wide text-ink-soft">Cómo usarlo</h2>
      <p className="mt-2 text-ink-soft">{entry.usage}</p>

      {entry.dependencies && (
        <p className="mt-4 text-sm text-ink-soft">
          Dependencias: {entry.dependencies.map((d) => (
            <code key={d} className="mr-1 rounded bg-white/60 px-1.5 py-0.5 font-mono text-xs">{d}</code>
          ))}
        </p>
      )}

      <p className="mt-6 text-xs text-ink-soft">Creado el {entry.createdAt}</p>
    </article>
  )
}
