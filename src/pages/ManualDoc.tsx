import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import MarkdownView from '../components/content/MarkdownView'
import OfficialDocs from '../components/content/OfficialDocs'
import Related from '../components/content/Related'
import SpanishNote from '../components/content/SpanishNote'
import Toc from '../components/content/Toc'
import { getManualDoc } from '../lib/content'
import { formatDate } from '../lib/format'
import { sectionNames, useLang, useT } from '../lib/i18n'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const TEXT = {
  es: {
    notFound: 'No encontré ese documento.',
    notFoundTitle: 'No encontrado',
    back: 'Volver al Manual',
    reading: 'min de lectura',
    updated: (d: string) => `Actualizado el ${d}`,
  },
  en: {
    notFound: 'I couldn’t find that document.',
    notFoundTitle: 'Not found',
    back: 'Back to the Manual',
    reading: 'min read',
    updated: (d: string) => `Updated on ${d}`,
  },
}

export default function ManualDoc() {
  const { category = '', slug = '' } = useParams()
  const doc = getManualDoc(category, slug)
  const lang = useLang()
  const t = useT(TEXT)
  useDocumentTitle(doc?.title ?? t.notFoundTitle)

  if (!doc) {
    return (
      <section>
        <p className="text-ink-soft">{t.notFound}</p>
        <Link to="/manual" className="mt-3 inline-flex min-h-11 items-center text-sage-deep underline">
          {t.back}
        </Link>
      </section>
    )
  }

  return (
    <article>
      <Link to="/manual" className="inline-flex min-h-8 items-center gap-1 text-sm text-ink-soft hover:text-sage-deep">
        <ArrowLeft size={14} aria-hidden /> {sectionNames[lang].manual}
      </Link>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight" lang="es">{doc.title}</h1>
      <p className="mt-2 max-w-xl text-ink-soft" lang="es">{doc.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="rounded-full bg-sage/30 px-2 py-0.5 capitalize text-sage-deep">{doc.category}</span>
        {doc.technologies.filter((x) => x.toLowerCase() !== doc.category.toLowerCase()).map((x) => (
          <span key={x} className="rounded-full bg-lavender/50 px-2 py-0.5 text-lavender-deep">
            {x}
          </span>
        ))}
        {doc.tags.map((x) => (
          <span key={x} className="rounded-full bg-surface/60 px-2 py-0.5 text-ink-soft" lang="es">
            #{x}
          </span>
        ))}
        <span className="ml-1 text-ink-soft">
          · {doc.readingMinutes} {t.reading} · {t.updated(formatDate(doc.updatedAt ?? doc.createdAt, lang))}
        </span>
      </div>
      <SpanishNote />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="min-w-0" lang="es">
          <MarkdownView source={doc.body} />
          <OfficialDocs references={doc.references} />
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
