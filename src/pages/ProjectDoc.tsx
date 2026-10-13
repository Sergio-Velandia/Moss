import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import MarkdownView from '../components/content/MarkdownView'
import ProjectFacts from '../components/content/ProjectFacts'
import Related from '../components/content/Related'
import SpanishNote from '../components/content/SpanishNote'
import Toc from '../components/content/Toc'
import { getProject } from '../lib/content'
import { useT } from '../lib/i18n'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const TEXT = {
  es: { notFound: 'No encontré ese proyecto.', notFoundTitle: 'No encontrado', back: 'Volver a Proyectos', section: 'Proyectos' },
  en: { notFound: 'I couldn’t find that project.', notFoundTitle: 'Not found', back: 'Back to Projects', section: 'Projects' },
}

export default function ProjectDoc() {
  const { slug = '' } = useParams()
  const doc = getProject(slug)
  const t = useT(TEXT)
  useDocumentTitle(doc?.title ?? t.notFoundTitle)

  if (!doc || !doc.project) {
    return (
      <section>
        <p className="text-ink-soft">{t.notFound}</p>
        <Link to="/proyectos" className="mt-3 inline-flex min-h-11 items-center text-sage-deep underline">
          {t.back}
        </Link>
      </section>
    )
  }

  return (
    <article>
      <Link to="/proyectos" className="inline-flex min-h-8 items-center gap-1 text-sm text-ink-soft hover:text-sage-deep">
        <ArrowLeft size={14} aria-hidden /> {t.section}
      </Link>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight" lang="es">{doc.title}</h1>
      <p className="mt-2 max-w-2xl text-ink-soft" lang="es">{doc.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        {doc.technologies.map((x) => (
          <span key={x} className="rounded-full bg-lavender/50 px-2 py-0.5 text-lavender-deep">
            {x}
          </span>
        ))}
      </div>
      <SpanishNote />

      <ProjectFacts facts={doc.project} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="min-w-0" lang="es">
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
