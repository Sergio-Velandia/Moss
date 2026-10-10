import { Link } from 'react-router-dom'
import MarkdownView from '../components/content/MarkdownView'
import { site } from '../data/site'
import { formatDate } from '../lib/format'
import { getLegalPage } from '../lib/legal'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function Legal({ slug }: { slug: string }) {
  const page = getLegalPage(slug)
  useDocumentTitle(page?.title ?? 'No encontrado')

  if (!page) {
    return (
      <section>
        <p className="text-ink-soft">No encontré esa página.</p>
        <Link to="/" className="mt-3 inline-flex min-h-11 items-center text-sage-deep underline">
          Volver al inicio
        </Link>
      </section>
    )
  }

  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">{page.title}</h1>
      <p className="mt-2 text-sm text-ink-soft">Última actualización: {formatDate(site.legalUpdatedAt)}</p>
      <div className="mt-8">
        <MarkdownView source={page.body} />
      </div>
    </article>
  )
}
