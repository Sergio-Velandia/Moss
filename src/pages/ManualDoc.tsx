import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import MarkdownView from '../components/content/MarkdownView'
import Related from '../components/content/Related'
import Toc from '../components/content/Toc'
import { getManualDoc } from '../lib/content'
import { formatDate } from '../lib/format'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function ManualDoc() {
  const { category = '', slug = '' } = useParams()
  const doc = getManualDoc(category, slug)
  useDocumentTitle(doc?.title ?? 'No encontrado')

  if (!doc) {
    return (
      <section>
        <p className="text-ink-soft">No encontré ese documento.</p>
        <Link to="/manual" className="mt-3 inline-flex min-h-11 items-center text-sage-deep underline">
          Volver al Manual
        </Link>
      </section>
    )
  }

  return (
    <article>
      <Link to="/manual" className="inline-flex min-h-8 items-center gap-1 text-sm text-ink-soft hover:text-sage-deep">
        <ArrowLeft size={14} aria-hidden /> Manual
      </Link>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{doc.title}</h1>
      <p className="mt-2 max-w-xl text-ink-soft">{doc.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="rounded-full bg-sage/30 px-2 py-0.5 capitalize text-sage-deep">{doc.category}</span>
        {doc.technologies.filter((t) => t.toLowerCase() !== doc.category.toLowerCase()).map((t) => (
          <span key={t} className="rounded-full bg-lavender/50 px-2 py-0.5 text-lavender-deep">
            {t}
          </span>
        ))}
        {doc.tags.map((t) => (
          <span key={t} className="rounded-full bg-surface/60 px-2 py-0.5 text-ink-soft">
            #{t}
          </span>
        ))}
        <span className="ml-1 text-ink-soft">
          · {doc.readingMinutes} min de lectura · Actualizado el {formatDate(doc.updatedAt ?? doc.createdAt)}
        </span>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="min-w-0">
          <MarkdownView source={doc.body} />
        </div>
        <div className="order-first lg:order-last">
          <div className="lg:sticky lg:top-24">
            <Toc headings={doc.headings} />
          </div>
        </div>
      </div>

      <Related ids={doc.related} />
    </article>
  )
}
