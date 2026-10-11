import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import MarkdownView from '../components/content/MarkdownView'
import Related from '../components/content/Related'
import SpanishNote from '../components/content/SpanishNote'
import { getJournalPost, journalPosts } from '../lib/content'
import { formatDate } from '../lib/format'
import { sectionNames, useLang, useT } from '../lib/i18n'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const TEXT = {
  es: {
    notFound: 'No encontré ese artículo.',
    notFoundTitle: 'No encontrado',
    back: 'Volver a la Bitácora',
    reading: 'min de lectura',
    more: 'Más artículos',
    previous: 'Anterior',
    next: 'Siguiente',
  },
  en: {
    notFound: 'I couldn’t find that article.',
    notFoundTitle: 'Not found',
    back: 'Back to the Journal',
    reading: 'min read',
    more: 'More articles',
    previous: 'Previous',
    next: 'Next',
  },
}

export default function JournalPost() {
  const { slug = '' } = useParams()
  const post = getJournalPost(slug)
  const lang = useLang()
  const t = useT(TEXT)
  useDocumentTitle(post?.title ?? t.notFoundTitle)

  if (!post) {
    return (
      <section>
        <p className="text-ink-soft">{t.notFound}</p>
        <Link to="/bitacora" className="mt-3 inline-flex min-h-11 items-center text-sage-deep underline">
          {t.back}
        </Link>
      </section>
    )
  }

  // journalPosts está ordenado del más reciente al más antiguo
  const idx = journalPosts.findIndex((p) => p.id === post.id)
  const newer = idx > 0 ? journalPosts[idx - 1] : undefined
  const older = idx < journalPosts.length - 1 ? journalPosts[idx + 1] : undefined

  return (
    <article className="mx-auto max-w-2xl">
      <Link to="/bitacora" className="inline-flex min-h-8 items-center gap-1 text-sm text-ink-soft hover:text-sage-deep">
        <ArrowLeft size={14} aria-hidden /> {sectionNames[lang].journal}
      </Link>

      <p className="mt-4 text-xs text-ink-soft">
        {formatDate(post.createdAt, lang)} · <span className="text-sage-deep" lang="es">{post.category}</span> ·{' '}
        {post.readingMinutes} {t.reading}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight" lang="es">{post.title}</h1>
      <p className="mt-2 text-ink-soft" lang="es">{post.description}</p>
      <SpanishNote />

      <div className="mt-8" lang="es">
        <MarkdownView source={post.body} />
      </div>

      <Related ids={post.related} />

      <nav aria-label={t.more} className="mt-12 grid gap-3 sm:grid-cols-2">
        {older ? (
          <Link to={older.url} className="rounded-2xl border border-surface/70 bg-surface/50 p-4 text-sm transition hover:shadow-md">
            <span className="flex items-center gap-1 text-xs text-ink-soft">
              <ArrowLeft size={12} aria-hidden /> {t.previous}
            </span>
            <span className="mt-1 block font-medium" lang="es">{older.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {newer && (
          <Link
            to={newer.url}
            className="rounded-2xl border border-surface/70 bg-surface/50 p-4 text-right text-sm transition hover:shadow-md"
          >
            <span className="flex items-center justify-end gap-1 text-xs text-ink-soft">
              {t.next} <ArrowRight size={12} aria-hidden />
            </span>
            <span className="mt-1 block font-medium" lang="es">{newer.title}</span>
          </Link>
        )}
      </nav>
    </article>
  )
}
