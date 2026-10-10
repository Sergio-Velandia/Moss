import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import MarkdownView from '../components/content/MarkdownView'
import Related from '../components/content/Related'
import { getJournalPost, journalPosts } from '../lib/content'
import { formatDate } from '../lib/format'

export default function JournalPost() {
  const { slug = '' } = useParams()
  const post = getJournalPost(slug)

  if (!post) {
    return (
      <section>
        <p className="text-ink-soft">No encontré ese artículo.</p>
        <Link to="/bitacora" className="mt-3 inline-block text-sage-deep underline">
          Volver a la Bitácora
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
      <Link to="/bitacora" className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-sage-deep">
        <ArrowLeft size={14} aria-hidden /> Bitácora
      </Link>

      <p className="mt-4 text-xs text-ink-soft">
        {formatDate(post.createdAt)} · <span className="text-sage-deep">{post.category}</span> · {post.readingMinutes}{' '}
        min de lectura
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{post.title}</h1>
      <p className="mt-2 text-ink-soft">{post.description}</p>

      <div className="mt-8">
        <MarkdownView source={post.body} />
      </div>

      <Related ids={post.related} />

      <nav aria-label="Más artículos" className="mt-12 grid gap-3 sm:grid-cols-2">
        {older ? (
          <Link to={older.url} className="rounded-2xl border border-white/70 bg-white/50 p-4 text-sm transition hover:shadow-md">
            <span className="flex items-center gap-1 text-xs text-ink-soft">
              <ArrowLeft size={12} aria-hidden /> Anterior
            </span>
            <span className="mt-1 block font-medium">{older.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {newer && (
          <Link
            to={newer.url}
            className="rounded-2xl border border-white/70 bg-white/50 p-4 text-right text-sm transition hover:shadow-md"
          >
            <span className="flex items-center justify-end gap-1 text-xs text-ink-soft">
              Siguiente <ArrowRight size={12} aria-hidden />
            </span>
            <span className="mt-1 block font-medium">{newer.title}</span>
          </Link>
        )}
      </nav>
    </article>
  )
}
