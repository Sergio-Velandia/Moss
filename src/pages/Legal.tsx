import { Link } from 'react-router-dom'
import MarkdownView from '../components/content/MarkdownView'
import SpanishNote from '../components/content/SpanishNote'
import { site } from '../data/site'
import { formatDate } from '../lib/format'
import { useLang, useT } from '../lib/i18n'
import { getLegalPage } from '../lib/legal'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const TEXT = {
  es: { notFound: 'No encontré esa página.', notFoundTitle: 'No encontrado', back: 'Volver al inicio', updated: 'Última actualización:' },
  en: { notFound: 'I couldn’t find that page.', notFoundTitle: 'Not found', back: 'Back home', updated: 'Last updated:' },
}

export default function Legal({ slug }: { slug: string }) {
  const page = getLegalPage(slug)
  const lang = useLang()
  const t = useT(TEXT)
  useDocumentTitle(page?.title ?? t.notFoundTitle)

  if (!page) {
    return (
      <section>
        <p className="text-ink-soft">{t.notFound}</p>
        <Link to="/" className="mt-3 inline-flex min-h-11 items-center text-sage-deep underline">
          {t.back}
        </Link>
      </section>
    )
  }

  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight" lang="es">{page.title}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {t.updated} {formatDate(site.legalUpdatedAt, lang)}
      </p>
      <SpanishNote />
      <div className="mt-8" lang="es">
        <MarkdownView source={page.body} />
      </div>
    </article>
  )
}
